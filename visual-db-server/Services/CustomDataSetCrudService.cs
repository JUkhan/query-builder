using chatApp.DB;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using visual_db_server.Models;

namespace visual_db_server.Services;

public class CustomDataSetCrudService: ICustomDataSetCrudService
{
    private readonly ISqlExecutor _sqlExecutor;
    //private readonly ILoggedInUserService _loggedInUserService;
    //private readonly IUserAccessControlService _userAccessControlService;
    private readonly IInformationSchemaService _informationSchemaService;
    private readonly ICustomDatasetRepository _repository;
    private readonly IProcessRepository _processRepository;

    public CustomDataSetCrudService(
        ISqlExecutor sqlExecutor,
        ICustomDatasetRepository repository,
        IProcessRepository processRepository,
        IInformationSchemaService informationSchemaService)
    {
        _sqlExecutor = sqlExecutor;
        _repository = repository;
        //_userAccessControlService = userAccessControlService;
        _processRepository = processRepository;
        //_loggedInUserService = loggedInUserService;
        _informationSchemaService = informationSchemaService;
    }

    public async Task<CustomDataset> Insert(CustomDataset postModel)
    {
        var matchedDataset = _repository
            .GetConditional(cd => !string.IsNullOrWhiteSpace(cd.DatasetName)
            && !string.IsNullOrWhiteSpace(postModel.DatasetName)
            && cd.DatasetName.ToLower().Equals(postModel.DatasetName.ToLower()));

        if (matchedDataset.Any()) throw new CrudException("CustomDataset with this DatasetName already exists");

        if (postModel.QueryType == "Query")
        {
            if (CanCreateTable(postModel))
            {
                return await _repository.AddAsync(postModel);
            }

            throw new CrudException("Table Creation failed");
        }

        if (postModel.QueryType == "Function")
        {
            var functionName = postModel.DatasetName.Split("(")[0];
            var createFuctionQuery = ReplaceFunctionName(postModel.WebQuery, @$"customdataset.{functionName}");
            postModel.WebQuery = createFuctionQuery;
            createFuctionQuery = $@"drop function if exists customdataset.{functionName};
                                       {createFuctionQuery}";

            _sqlExecutor.ExecuteQuery(createFuctionQuery);
            return await _repository.AddAsync(postModel);
        }

        var query = $@"SELECT table_name FROM information_schema.tables
                           --WHERE table_schema = 'customdataset'
                           union
                          SELECT  matviewname as table_name
                         FROM pg_matviews
                        -- where schemaname='customdataset';";
        var tableNameList = _sqlExecutor.Query<string>(query).ToList();
        tableNameList = tableNameList.Select(x => x.ToLower()).ToList();

        if (tableNameList.Contains(postModel.DatasetName.ToLower()))
        {
            throw new CrudException("TableName with this DatasetName already exists");
        }

        if (ContainsValidDoubleBrace(postModel.WebQuery!))
        {
            throw new CrudException("View can't contain curly braces like this.");
        }

        var customDataSet = await _repository.AddAsync(postModel);

        if (!IsCreateViewSuccessfulForInsert(postModel))
        {
            await _repository.DeleteAsync(postModel);
            throw new CrudException("Dataset Creation failed");
        }

        return customDataSet;
    }

    private string ReplaceFunctionName(string originalSql, string newFunctionName)
    {
        // Regex pattern to match function name after "CREATE OR REPLACE FUNCTION"
        string pattern = @"CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([a-zA-Z0-9_]+)\s*\(";

        // Use regular expression to find and replace the function name
        return Regex.Replace(originalSql, pattern, match =>
        {
            return match.Value.Replace(match.Groups[1].Value, newFunctionName); // Replace function name
        });
    }

    private bool CanCreateTable(CustomDataset postModel)
    {
        var tableName = postModel.DatasetName!.ToLower();

        try
        {
            var query = postModel.WebQuery!.Contains("{_current_user_id}") ? postModel.WebQuery.Replace("{_current_user_id}",
                /*$"'{_loggedInUserService.GetCurrentUserId()}'"*/"") : postModel.WebQuery;

            _sqlExecutor.ExecuteQuery($@"
                    DROP TABLE IF EXISTS customdataset.{tableName};
                    CREATE TABLE customdataset.{tableName} AS ({query}) limit 0
                ");

            return true;
        }
        catch
        {
            throw new CrudException("Table Creation failed");
        }
    }

    private static bool ContainsValidDoubleBrace(string dataSetName)
    {
        var pattern = @"\{[^{}]*_[^{}]*\}";

        return Regex.IsMatch(dataSetName, pattern);
    }

    public bool IsCreateViewSuccessfulForInsert(CustomDataset postModel)
    {
        try
        {
            var createViewQuery = string.Empty;

            if (postModel.QueryType! == "Materialized_View")
            {
                createViewQuery = $"DROP MATERIALIZED VIEW IF EXISTS customdataset.{postModel.DatasetName};" +
                $"create materialized view customdataset.{postModel.DatasetName} as ({postModel.WebQuery});";
            }
            else
            {
                createViewQuery = $"DROP VIEW IF EXISTS customdataset.{postModel.DatasetName};" +
                $"create view  customdataset.{postModel.DatasetName} as ({postModel.WebQuery});";
            }

            _sqlExecutor.Execute(createViewQuery);
            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public dynamic? GetCustomDatasetColumnValue(CustomDatasetColumValueDto customDatasetColumValueDto)
    {
        if (string.IsNullOrWhiteSpace(customDatasetColumValueDto.DatasetName))
            return string.Empty;

        var datasetName = customDatasetColumValueDto.DatasetName.ToLower();
        var whereClause = !string.IsNullOrWhiteSpace(customDatasetColumValueDto.whereClause)
                              ? $"where {customDatasetColumValueDto.whereClause}"
                              : string.Empty;

        var query = $@"select {customDatasetColumValueDto.ColumnName} from customdataset.{datasetName} {whereClause}";

        var columnValue = _sqlExecutor.ExecuteG<dynamic>(query).FirstOrDefault();
        return columnValue;
    }

    public async Task<dynamic> Update(CustomDataset postModel)
    {
        var previousData = await _repository.GetByIdAsync(postModel.Id);

        if (postModel.QueryType == "Function")
        {
            var functionName = postModel.DatasetName.Split("(")[0];
            var createFuctionQuery = ReplaceFunctionName(postModel.WebQuery, @$"customdataset.{functionName}");
            postModel.WebQuery = createFuctionQuery;
            createFuctionQuery = $@"drop function if exists customdataset.{functionName};
                                       {createFuctionQuery}";

            _sqlExecutor.ExecuteQuery(createFuctionQuery);
            return await _repository.UpdateAsync(postModel);
        }
        if (postModel.QueryType == "Query")
        {
            if (previousData.QueryType != "Query")
            {
                var dropViewQuery = previousData.QueryType == "Materialized_View" ?
                    $"DROP  MATERIALIZED VIEW IF EXISTS customdataset.{previousData.DatasetName!.ToLower()} cascade;" :
                    $"DROP VIEW IF EXISTS customdataset.{previousData.DatasetName!.ToLower()} cascade;";
                _sqlExecutor.Execute(dropViewQuery);
            }

            if (postModel.DatasetName != previousData.DatasetName)
            {
                _sqlExecutor.Execute($"DROP TABLE IF EXISTS customdataset.{previousData.DatasetName!.ToLower()};");
            }

            if (CanCreateTable(postModel))
            {
                return await _repository.UpdateAsync(postModel);
            }

            throw new CrudException("Table Creation failed");
        }

        if (postModel.DatasetName != previousData.DatasetName)
        {
            var query = $@"SELECT table_name FROM information_schema.tables
                           WHERE table_name != '{postModel.DatasetName.ToLower()}'
                           union
                          SELECT  matviewname as table_name
                         FROM pg_matviews
                        where matviewname != '{postModel.DatasetName.ToLower()}';";
            var tableNameList = _sqlExecutor.Query<string>(query).ToList();
            tableNameList = tableNameList.Select(x => x.ToLower()).ToList();

            if (tableNameList.Contains(postModel.DatasetName.ToLower()))
            {
                throw new CrudException("TableName with this DatasetName already exists");
            }
        }

        if (!await IsCreateViewSuccessfulForUpdate(postModel))
        {
           await _repository.UpdateAsync(previousData);
            throw new CrudException("Dataset Creation failed");
        }

        return await _repository.UpdateAsync(postModel);
        
    }

    private async Task<bool> IsCreateViewSuccessfulForUpdate(CustomDataset postModel)
    {
        try
        {
            var previousData = await _repository.GetByIdAsync(postModel.Id);
            //var updatedCustomDataSet = base.Update(postModel);
            var dependentViewQuery =
                $"SELECT * FROM find_all_dependent_views('{Schema.CustomDataset}', '{postModel.DatasetName.ToLower()}');";
            var listOfView = _sqlExecutor
                .ExecuteG<(string DependentSchema, string DependentView)>(dependentViewQuery)
                .Select(x => x.DependentView);

            var createViewQuery = postModel.QueryType == "Materialized_View" ?
                $"create materialized view customdataset.{postModel.DatasetName} as ({postModel.WebQuery});" :
                $"create or replace view customdataset.{postModel.DatasetName} as ({postModel.WebQuery});";

            var dropViewQuery = previousData.QueryType == "Materialized_View" ?
                $"DROP  MATERIALIZED VIEW IF EXISTS customdataset.{previousData.DatasetName.ToLower()} cascade;" :
                $"DROP VIEW IF EXISTS customdataset.{previousData.DatasetName.ToLower()} cascade;";

            _sqlExecutor.Execute(dropViewQuery);
            _sqlExecutor.Execute(createViewQuery);

            var dependentListOfView = listOfView
                .Where(x => x != postModel.DatasetName.ToLower())
                .ToList();
            var customDatasetListForDependentView = _repository.GetConditional(x => dependentListOfView.Contains(x.DatasetName.ToLower())).ToList();
            var createDependentViewQuery = string.Empty;
            foreach (var viewInfo in customDatasetListForDependentView)
            {
                createDependentViewQuery += viewInfo.QueryType == "Materialized_View" ?
                                   $"create materialized view customdataset.{viewInfo.DatasetName} as ({viewInfo.WebQuery}); " :
                                   $"create or replace view customdataset.{viewInfo.DatasetName} as ({viewInfo.WebQuery}); ";
            }

            if (!string.IsNullOrWhiteSpace(createDependentViewQuery)) _sqlExecutor.Execute(createDependentViewQuery);

            return true;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task<dynamic> Delete(string id)
    {
        var stateBeforeDelete = await _repository.GetByIdAsync(id);
        var deletedData=await _repository.DeleteAsync(stateBeforeDelete);

        var dropViewQuery = string.Empty;

        if (stateBeforeDelete.QueryType == "Query")
        {
            dropViewQuery = $"DROP TABLE IF EXISTS customdataset.{stateBeforeDelete.DatasetName!.ToLower()};";
        }
        else if (stateBeforeDelete.QueryType == "Materialized_View")
        {
            dropViewQuery = $"DROP MATERIALIZED VIEW IF EXISTS customdataset.{stateBeforeDelete.DatasetName};";
        }
        else
        {
            dropViewQuery = $"DROP VIEW IF EXISTS customdataset.{stateBeforeDelete.DatasetName};";
        }

         _sqlExecutor.Execute(dropViewQuery);
        return deletedData;
    }

    public List<ValueLabel> GetCustomDataSetSchemaTableList()
    {
        var query = $@"SELECT table_name
                        FROM information_schema.tables
                        WHERE table_schema = 'customdataset'
                        union
                        SELECT matviewname as table_name
                        FROM pg_matviews
                        where schemaname = 'customdataset'
                        union
                        select dataset_name from custom_dataset
                        where query_type = 'Query';";
        var tableNameList = _sqlExecutor.Query<string>(query).ToList();
        var tableList = _sqlExecutor.Query<ValueLabel>($@"select lower(dataset_name) as value ,lower(dataset_name) as label from custom_dataset where query_type='Function';")
                        .ToList();

        var tableListValueLabel = tableNameList.Select(x => new ValueLabel
        {
            value = x,
            label = x
        }).ToList();

        tableListValueLabel.AddRange(tableList);
        return tableListValueLabel;
    }

    public List<ValueLabel> GetReferencedCustomDataSetSchemaTableList()
    {
        var customDatasetList =  _repository.GetConditional(x => !string.IsNullOrEmpty(x.AdditionalConfig))
            .ToList()  // Fetch the data from the database first
            .Where(x =>
            {
                try
                {
                    // Parse the JSON and check the value of 'IsUsedAsReference'
                    var json = JsonDocument.Parse(x.AdditionalConfig);
                    return json.RootElement.TryGetProperty("IsUsedAsReference", out var isUsedAsReference) && isUsedAsReference.GetBoolean();
                }
                catch
                {
                    // If parsing fails, return false (or handle error as needed)
                    return false;
                }
            }).AsQueryable();

        var selectedCustomDataset = new List<ValueLabel>();

        foreach (var item in customDatasetList)
        {
            selectedCustomDataset.Add(new ValueLabel
            {
                label = item.DatasetName.ToLower(),
                value = item.DatasetName.ToLower()
            });
        }

        return selectedCustomDataset;
    }

    public List<ValueLabel> GetAllTableList(string schemaName = "")
    {
        var publicTableList = string.Empty;
        var tableNameList = new List<string>();

        if (string.IsNullOrWhiteSpace(schemaName))
        {
            publicTableList = $@" union SELECT  table_name as table_name
                                     FROM information_schema.tables
                                     where table_schema='public'";
            schemaName = "customdataset";
            tableNameList.Add("\"user\"");
        }

        var query = $@"SELECT CASE
                                WHEN table_schema = 'customdataset' THEN 'customdataset.' || table_name
                                ELSE table_name
                            END AS table_name FROM information_schema.tables
                            WHERE table_schema = '{schemaName}'
                            union
                            SELECT  CASE
                                WHEN schemaname = 'customdataset' THEN 'customdataset.' || matviewname
                                ELSE matviewname
                            END AS table_name
                            FROM pg_matviews
                            where schemaname='{schemaName}'
                            {publicTableList} ;";

        tableNameList = _sqlExecutor.Query<string>(query).ToList();
        var tableList = _sqlExecutor.Query<ValueLabel>($@"select lower(dataset_name) as value ,lower(dataset_name) as label from custom_dataset where query_type='Function';")
                        .ToList();
        var tableListValueLabe = tableNameList.Select(x => new ValueLabel
        {
            value = x,
            label = x
        }).ToList();
        tableListValueLabe.AddRange(tableList);
        return tableListValueLabe;
    }

    public List<ValueLabel> GetSchemaList()
    {
        var query = $"SELECT schema_name FROM information_schema.schemata;";
        var schemalist = _sqlExecutor.ExecuteG<string>(query).ToList();

        return schemalist.Select(x => new ValueLabel
        {
            value = x,
            label = x
        }).ToList();
    }

    public dynamic GetPreviewData(string query)
    {
        try
        {
            var tableDataList = _sqlExecutor.Query<dynamic>($"{query} limit 10").ToList();
            return new { Data = tableDataList, RowCount = 10 };
        }
        catch (Exception ex)
        {
            throw new CrudException("Wrong Query");
        }
    }

    public List<string> GetColumnList(string tableName)
    {
        if (tableName.Contains("customdataset"))
        {
            tableName = tableName.Split('.')[1];
        }

        var query = $@"SELECT column_name FROM information_schema.columns where table_schema='customdataset'
	                     and table_name='{tableName}';";

        var columnList = _sqlExecutor.Query<string>(query).ToList();

        if (columnList.Count == 0)
        {
            query = $@"SELECT column_name FROM information_schema.columns where table_schema='public'
	                     and table_name='{tableName}';";

            columnList = _sqlExecutor.Query<string>(query).ToList();
        }

        if (columnList.Count == 0)
        {
            query = $@"SELECT
                               a.attname                            AS column_name
                        FROM (SELECT LOWER(dataset_name) AS view_name
                              FROM public.custom_dataset
                              WHERE query_type = 'Materialized_View'
                                AND LOWER(dataset_name)='{tableName}') mv
                                 JOIN
                             pg_class c ON c.relname = mv.view_name
                                 JOIN
                             pg_attribute a ON a.attrelid = c.oid
                        WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'customdataset')
                          AND a.attnum > 0
                          AND NOT a.attisdropped;";

            columnList = _sqlExecutor.Query<string>(query).ToList();
        }

        return columnList;
    }

    public List<TableMetaData> GetColumnListWithType(string tableName)
    {
        if (tableName.Contains("customdataset"))
        {
            tableName = tableName.Split('.')[1];
        }

        var query = $@"SELECT column_name,data_type FROM information_schema.columns where table_schema='customdataset'
	                     and table_name='{tableName}';";

        var columnList = _sqlExecutor.Query<TableMetaData>(query).ToList();

        if (columnList.Count == 0)
        {
            query = $@"SELECT column_name,data_type FROM information_schema.columns where table_schema='public'
	                     and table_name='{tableName}';";

            columnList = _sqlExecutor.Query<TableMetaData>(query).ToList();
        }

        if (columnList.Count == 0)
        {
            query = $@"SELECT
                               a.attname                            AS column_name,
                               t.typname AS data_type
                        FROM (SELECT LOWER(dataset_name) AS view_name
                              FROM public.custom_dataset
                              WHERE query_type = 'Materialized_View'
                                AND LOWER(dataset_name)='{tableName}') mv
                                 JOIN
                             pg_class c ON c.relname = mv.view_name
                                 JOIN
                             pg_attribute a ON a.attrelid = c.oid
                                 JOIN
                             pg_type t ON a.atttypid = t.oid
                        WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'customdataset')
                          AND a.attnum > 0
                          AND NOT a.attisdropped;";

            columnList = _sqlExecutor.Query<TableMetaData>(query).ToList();
        }

        return columnList;
    }

    /*public List<string> GetPermittedCustomDataSet()
    {
        var permittedSurveyFormList = _userAccessControlService.GetPermittedSurveyForm();
        var customDatasetNameList = new List<string>();
        var processConfigList = _processRepository.GetAll().Select(x => x.StepConfig).ToList();
        processConfigList = processConfigList.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();

        foreach (var processConfig in processConfigList)
        {
            JObject jsonObject = JObject.Parse(processConfig);

            var steps = jsonObject["sequence"];
            foreach (var step in steps)
            {
                if (step?["properties"]?["widgetType"] != null && step["properties"]["widgetType"].ToString() == "LIST_VIEW")
                {
                    string configString = step["properties"]["config"]?.ToString();
                    if (!IsValidJson(configString))
                    {
                        continue;
                    }
                    var configObject = JObject.Parse(configString);

                    if (configObject["data_bag"]?["custom_data_set"] != null)
                    {
                        string mainDataset = configObject["data_bag"]["custom_data_set"]["main_dataset"]?.ToString();
                        if (mainDataset != null)
                        {
                            customDatasetNameList.Add(mainDataset);
                        }
                    }
                }
            }
        }

        foreach (var surveyForm in permittedSurveyFormList)
        {
            try
            {
                var surveyFormQuestion = surveyForm.Questions;
                var questionList = JsonConvert.DeserializeObject<List<Question>>(surveyFormQuestion);
                var customDataseNames = GetCustomDatasetNames(questionList).ToList();
                customDatasetNameList.AddRange(customDataseNames);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        var query = $@"select dataset_name from custom_dataset where is_query_for_mobile=true;";
        var mobileApplicableCustomDataset = _sqlExecutor.Query<string>(query).ToList();
        mobileApplicableCustomDataset = mobileApplicableCustomDataset.Select(x => x.ToLower()).ToList();
        customDatasetNameList.AddRange(mobileApplicableCustomDataset);

        if (customDatasetNameList.Count > 0)
        {
            var viewCsvList = customDatasetNameList.Select(x => $@"'{x}'").ToList();
            var viewCsv = string.Join(",", viewCsvList);
            var dependentViewQuery = GetDependentViewQueryForMultipleView(viewCsv);
            var listOfView = _sqlExecutor.ExecuteG<string>(dependentViewQuery).ToList();
            customDatasetNameList.AddRange(listOfView);
        }

        customDatasetNameList = customDatasetNameList.Select(x => x.ToString().ToLower()).ToList();
        customDatasetNameList = customDatasetNameList.Distinct().ToList();
        customDatasetNameList = customDatasetNameList.Select(x => x.ToLower()).ToList();

        return customDatasetNameList.Distinct().ToList();
    }*/

    public bool IsValidJson(string jsonString)
    {
        try
        {
            // Attempt to parse the JSON string
            JObject.Parse(jsonString);
            return true; // JSON is valid
        }
        catch (JsonReaderException)
        {
            return false; // JSON is invalid
        }
        catch (Exception)
        {
            return false; // Other exceptions (if any)
        }
    }

    public IEnumerable<string> GetCustomDatasetNames(IEnumerable<Question> questions)
    {
        //return questions.SelectMany(q => new[] { q.DataElementId }
        //    .Concat(GetAllDataElementIds(q.Items)));
        return questions.SelectMany(q =>
               q.linkedItem != null && !string.IsNullOrWhiteSpace(q.linkedItem.ItemInfo.CustomDatasetId) ?
                new[] { q.linkedItem.ItemInfo.CustomDatasetId }.Concat(GetCustomDatasetNames(q.Items)) :
               GetCustomDatasetNames(q.Items)
        );
    }

    public List<string> GetCustomDataSetColumnList(string? tableName)
    {
        if (string.IsNullOrEmpty(tableName)) return new List<string>();

        if (tableName.Contains("("))
        {
            var columnList = _informationSchemaService.
                              GetTableColumnNames("customdataset", tableName)
                              .ToList();
            return columnList;
        }

        string datasetQuery;

        if (IfQueryType(tableName))
        {
            var dataset = _repository
                .GetConditional(cds => cds.DatasetName == tableName)
                .FirstOrDefault();

            if (!string.IsNullOrEmpty(dataset!.WebQuery) && dataset.WebQuery.Contains("{_current_user_id}"))
            {
                dataset.WebQuery = dataset.WebQuery.Replace("{_current_user_id}", /*$"'{_loggedInUserService.GetCurrentUserId()}'"*/"");
            }

            datasetQuery = $"SELECT json_object_keys(row_to_json(t)) as column_names FROM ({dataset.WebQuery}) t group by column_names";
        }
        else
        {
            datasetQuery = $"SELECT column_name FROM information_schema.columns WHERE table_schema = 'customdataset' AND table_name = '{tableName}';";
        }

        var columnNameList = _sqlExecutor.Query<string>(datasetQuery).ToList();

        return columnNameList;
    }

    public List<ValueLabel> GetCustomDataSetSchemaColumnList(string tableName)
    {
        var columnNameList = GetCustomDataSetColumnList(tableName);
        return columnNameList.Select(x => new ValueLabel
        {
            value = x,
            label = x
        }).ToList();
    }

    private bool IfQueryType(string tableName)
    {
        var ifQueryType = _repository
            .GetConditional(cds => cds.DatasetName == tableName && cds.QueryType == "Query")
            .FirstOrDefault();

        return ifQueryType is not null;
    }

    public List<dynamic> GetCustomDataSetDropdown(CustomDatasetQueryModel customDatasetQueryModel)
    {
        var columnList = GetCustomDataSetColumnList(customDatasetQueryModel.DatasetName);
        var loggedInUserId = "";// _loggedInUserService.GetCurrentUserId();

        var dataSource = GetDataSource(customDatasetQueryModel.DatasetName!);

        if (dataSource.Contains("{_current_user_id}"))
        {
            dataSource = dataSource.Replace("{_current_user_id}", $"'{loggedInUserId}'");
        }

        var filterList = new List<string>();
        if (!string.IsNullOrWhiteSpace(customDatasetQueryModel.FilterInfo["catchment_id"]) && columnList.Contains("catchment_id"))
        {
            var catchmentSubClause = $@" catchment_id = '{customDatasetQueryModel.FilterInfo["catchment_id"]}' ";
            filterList.Add(catchmentSubClause);
        }
        if (!string.IsNullOrWhiteSpace(customDatasetQueryModel.FilterInfo["project_id"]) && columnList.Contains("project_id"))
        {
            var projectSubClause = $@" project_id = '{customDatasetQueryModel.FilterInfo["project_id"]}' ";
            filterList.Add(projectSubClause);
        }
        if (!string.IsNullOrWhiteSpace(customDatasetQueryModel.FilterInfo["country_id"]) && columnList.Contains("country_id"))
        {
            var countrySubClause = $@" country_id = '{customDatasetQueryModel.FilterInfo["country_id"]}' ";
            filterList.Add(countrySubClause);
        }
        if (!string.IsNullOrWhiteSpace(customDatasetQueryModel.FilterInfo["fiscal_year_id"]) && columnList.Contains("fiscal_year_id"))
        {
            var countrySubClause = $@" fiscal_year_id = '{customDatasetQueryModel.FilterInfo["fiscal_year_id"]}' ";
            filterList.Add(countrySubClause);
        }

        var afterWhereClause = string.Join(" and ", filterList);

        var finalWhereCaluse = string.IsNullOrWhiteSpace(afterWhereClause) ? string.Empty : $" where {afterWhereClause}";
        var relationFormulawhereClause = string.IsNullOrEmpty(customDatasetQueryModel.RelationFormula) ? string.Empty : $" {customDatasetQueryModel.RelationFormula.Replace("{_current_user_id}", $"'{loggedInUserId}'")}";
        if (string.IsNullOrWhiteSpace(finalWhereCaluse) && !string.IsNullOrWhiteSpace(relationFormulawhereClause))
            finalWhereCaluse += $" where  {relationFormulawhereClause}";
        if (!string.IsNullOrWhiteSpace(finalWhereCaluse) && !string.IsNullOrWhiteSpace(relationFormulawhereClause))
            finalWhereCaluse += $" and {relationFormulawhereClause}";

        if (string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedParentAttributeId)
            && string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedDisabilityCheckAttributeId))
        {
            var query = $"select {customDatasetQueryModel.ValueColumn} as value,{customDatasetQueryModel.LabelColumn} from {dataSource} {finalWhereCaluse};";
            var dropdownList = _sqlExecutor.Query<dynamic>(query).ToList();
            return dropdownList;
        }
        else if (!string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedParentAttributeId)
            && string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedDisabilityCheckAttributeId))
        {
            var query = $@"select {customDatasetQueryModel.ValueColumn} as value ,
                     {customDatasetQueryModel.LabelColumn},
                     {customDatasetQueryModel.SelectedParentAttributeId}
                     from {dataSource} {finalWhereCaluse};";
            var dropdownList = _sqlExecutor.Query<dynamic>(query).ToList();
            return dropdownList;
        }
        else if (string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedParentAttributeId)
            && !string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedDisabilityCheckAttributeId))
        {
            var query = $@"select {customDatasetQueryModel.ValueColumn} as value ,
                     {customDatasetQueryModel.LabelColumn},
                     {customDatasetQueryModel.SelectedDisabilityCheckAttributeId}
                     from {dataSource} {finalWhereCaluse};";
            var dropdownList = _sqlExecutor.Query<dynamic>(query).ToList();
            return dropdownList;
        }
        else if (!string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedParentAttributeId)
            && !string.IsNullOrWhiteSpace(customDatasetQueryModel.SelectedDisabilityCheckAttributeId))
        {
            var query = $@"select {customDatasetQueryModel.ValueColumn} as value,
                     {customDatasetQueryModel.LabelColumn},
                     {customDatasetQueryModel.SelectedParentAttributeId},
                     {customDatasetQueryModel.SelectedDisabilityCheckAttributeId}
                     from {dataSource} {finalWhereCaluse};";
            var dropdownList = _sqlExecutor.Query<dynamic>(query).ToList();
            return dropdownList;
        }
        else
        {
            return new List<dynamic>();
        }
    }


    private string GetDataSource(string datasetName)
    {
        var dataSet = _repository
            .GetConditional(ds => ds.DatasetName == datasetName)
            .FirstOrDefault();

        return dataSet?.QueryType == "Query" ? $"({dataSet?.WebQuery!}) t " : $"customdataset.{datasetName}";
    }

    private string GetDependentViewQueryForMultipleView(string viewNameCsv)
    {
        return @$"

            WITH RECURSIVE view_dependencies AS (
                SELECT
                    c1.oid AS view_oid,
                    c1.relname AS view_name,
                    c2.oid AS dependent_view_oid,
                    c2.relname AS dependent_view_name,
                    c1.relkind
                FROM
                    pg_class c1
                JOIN
                    pg_rewrite r ON c1.oid = r.ev_class
                JOIN
                    pg_depend d ON r.oid = d.objid
                JOIN
                    pg_class c2 ON d.refobjid = c2.oid
                join pg_namespace n1 on c1.relnamespace = n1.oid
                join pg_namespace n2 on c2.relnamespace = n2.oid
                WHERE
                    --c1.relkind  ='v' AND c2.relkind = 'v'
                    --and
                    n1.nspname = 'customdataset' and  n2.nspname = 'customdataset'
                UNION
                SELECT
                    vd.view_oid,
                    vd.view_name,
                    c3.oid AS dependent_view_oid,
                    c3.relname AS dependent_view_name,
                    c3.relkind
                        FROM
                            view_dependencies vd
                        JOIN
                            pg_rewrite r ON vd.dependent_view_oid = r.ev_class
                        JOIN
                            pg_depend d ON r.oid = d.objid
                        JOIN
                            pg_class c3 ON d.refobjid = c3.oid
                        --WHERE
                           -- c3.relkind = 'v'
                    )
            SELECT
                 dependent_view_name
            FROM
                view_dependencies
            WHERE
                view_name in ({viewNameCsv}) and relkind in ('v','m') --and dependent_view_name != 'svct';

             ";
    }

    public object GetCustomDatasetByName(string datasetName)
    {
        return _sqlExecutor.Execute($"select * from custom_dataset cd where cd.dataset_name = '{datasetName}' limit 1;");
    }

    public List<ValueLabel> TableListBySchemaName(string? schemaName)
    {
        if (string.IsNullOrEmpty(schemaName))
        {
            return new List<ValueLabel>();
        }

        var query = $@"SELECT table_name AS table_name
                FROM information_schema.tables
                WHERE table_schema = '{schemaName}'";

        var tableNameList = _sqlExecutor.Query<string>(query).ToList();

        return tableNameList.Select(t => new ValueLabel()
        {
            value = t,
            label = t
        }).ToList();
    }
}

