using chatApp.DB;
using visual_db_server.Models;

namespace visual_db_server.Services;

public interface ICustomDataSetCrudService
{
    List<ValueLabel> GetCustomDataSetSchemaTableList();
    List<ValueLabel> GetReferencedCustomDataSetSchemaTableList();
    dynamic? GetCustomDatasetColumnValue(CustomDatasetColumValueDto customDatasetColumValueDto);
    List<ValueLabel> GetAllTableList(string schemaName = "");
    List<ValueLabel> TableListBySchemaName(string? schemaName);
    List<ValueLabel> GetSchemaList();
    dynamic GetPreviewData(string query);
    List<string> GetColumnList(string tableName);
    List<TableMetaData> GetColumnListWithType(string tableName);
    List<ValueLabel> GetCustomDataSetSchemaColumnList(string tableName);
    List<dynamic> GetCustomDataSetDropdown(CustomDatasetQueryModel customDatasetQueryModel);
    object GetCustomDatasetByName(string datasetName);
    Task<CustomDataset> Insert(CustomDataset postModel);
    Task<dynamic> Update(CustomDataset postModel);

    Task<IReadOnlyList<CustomDataset>> GetAll();

    Task<CustomDataset> GetById(string id);
}
