using chatApp.DB;
using visual_db_server.Models;

namespace visual_db_server.Services;

public interface ICustomDatasetSnapShotService
{
    CustomDatasetSnapShotModel GetCustomDatasetSnapShotAsJson(string customDatasetId);

    void UploadCustomDatasetSnapShotAsJson(string fileContent);

    void UpsertCustomDataset(CustomDataset customDataset);
}

