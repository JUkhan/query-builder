using chatApp.DB;
using Newtonsoft.Json;
using visual_db_server.Models;

namespace visual_db_server.Services;

public class CustomDatasetSnapShotService : ICustomDatasetSnapShotService
{
    private readonly ISqlExecutor _sqlExecutor;
    private readonly ICustomDataSetCrudService _customDataSetCrudService;

    public CustomDatasetSnapShotService(
        ISqlExecutor executor,
        ICustomDataSetCrudService customDataSetCrudService)
    {
        _sqlExecutor = executor;
        _customDataSetCrudService = customDataSetCrudService;
    }

    public void UploadCustomDatasetSnapShotAsJson(string fileContent)
    {
        var customDataset = JsonConvert.DeserializeObject<CustomDatasetSnapShotModel>(fileContent)!;
        var dataset = CustomDatasetMapper.ToEntity(customDataset);
        UpsertCustomDataset(dataset);
    }

    public CustomDatasetSnapShotModel GetCustomDatasetSnapShotAsJson(string customDatasetId)
    {
        var query = $"select * from custom_dataset where Id = '{customDatasetId}';";
        var dataset = _sqlExecutor.ExecuteG<CustomDatasetSnapShotModel>(query).FirstOrDefault();

        return new CustomDatasetSnapShotModel
        {
            Id = dataset!.Id,
            DatasetName = dataset.DatasetName,
            WebQuery = dataset.WebQuery,
            CreateTime = dataset.CreateTime,
            LastModifiedTime = dataset.LastModifiedTime,
            IsDeleted = dataset.IsDeleted,
            CreatedBy = dataset.CreatedBy,
            LastModifiedBy = dataset.LastModifiedBy,
            IsQueryForMobile = dataset.IsQueryForMobile,
            MobileQuery = dataset.MobileQuery,
            QueryType = dataset.QueryType,
            IsDataDownloadableForMobile = dataset.IsDataDownloadableForMobile,
        };
    }

    private bool IsUpdateCustomDatasetSnapShot(CustomDataset data)
    {
        var query = $"select * from custom_dataset where Id = '{data.Id}';";
        var dataset = _sqlExecutor.ExecuteG<CustomDatasetSnapShotModel>(query).FirstOrDefault();

        return dataset == null;
    }

    public async void UpsertCustomDataset(CustomDataset customDataset)
    {
        if (IsUpdateCustomDatasetSnapShot(customDataset))
        {
            await _customDataSetCrudService.Insert(customDataset);
        }
        else
        {
            await _customDataSetCrudService.Update(customDataset);
        }
    }
}
