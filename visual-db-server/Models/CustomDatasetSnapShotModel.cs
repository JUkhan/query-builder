using chatApp.DB;

namespace visual_db_server.Models;

public class CustomDatasetSnapShotModel
{
    public string Id { get; set; } = string.Empty;
    public string DatasetName { get; set; } = string.Empty;
    public string WebQuery { get; set; } = string.Empty;
    public DateTime CreateTime { get; set; }
    public DateTime LastModifiedTime { get; set; }
    public bool? IsDeleted { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string LastModifiedBy { get; set; } = string.Empty;
    public bool? IsQueryForMobile { get; set; }
    public string MobileQuery { get; set; } = string.Empty;
    public string QueryType { get; set; } = string.Empty;
    public bool? IsDataDownloadableForMobile { get; set; }
}

public static class CustomDatasetMapper
{
    public static CustomDatasetSnapShotModel ToModel(CustomDataset entity)
    {
        return new CustomDatasetSnapShotModel
        {
            Id = entity.Id,
            DatasetName = entity.DatasetName ?? string.Empty,
            WebQuery = entity.WebQuery ?? string.Empty,
            MobileQuery = entity.MobileQuery ?? string.Empty,
            IsQueryForMobile = entity.IsQueryForMobile,
            IsDataDownloadableForMobile = entity.IsDataDownloadableForMobile,
            QueryType = entity.QueryType ?? string.Empty,
            CreateTime = entity.CreateTime ?? default,
            LastModifiedTime = entity.LastModifiedTime ?? default,
            IsDeleted = entity.IsDeleted,
            CreatedBy = entity.CreatedBy ?? string.Empty,
            LastModifiedBy = entity.LastModifiedBy ?? string.Empty
        };
    }

    public static CustomDataset ToEntity(CustomDatasetSnapShotModel model)
    {
        return new CustomDataset
        {
            Id = model.Id,
            DatasetName = model.DatasetName,
            WebQuery = model.WebQuery,
            MobileQuery = model.MobileQuery,
            IsQueryForMobile = model.IsQueryForMobile,
            IsDataDownloadableForMobile = model.IsDataDownloadableForMobile,
            QueryType = model.QueryType,
            CreateTime = model.CreateTime,
            LastModifiedTime = model.LastModifiedTime,
            IsDeleted = model.IsDeleted,
            CreatedBy = model.CreatedBy,
            LastModifiedBy = model.LastModifiedBy
        };
    }
}
