using chatApp.DB;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mime;
using visual_db_server.Models;
using visual_db_server.Services;

namespace visual_db_server.Controllers;

[ApiController]
[Produces(MediaTypeNames.Application.Json)]
[Route("CustomDataSet")]
public class CustomDataSetController : BaseController
{
    private readonly ICustomDataSetCrudService _customDataSetCrudService;
    private readonly ICustomDatasetSnapShotService _customDatasetSnapShotService;

    public CustomDataSetController(
        ICustomDataSetCrudService customDataSetCrudService,
        ICustomDatasetSnapShotService customDatasetSnapShotService)
    {
        _customDataSetCrudService = customDataSetCrudService;
        _customDatasetSnapShotService = customDatasetSnapShotService;
    }

    [HttpPost("UploadCustomDatasetSnapShotAsJson")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult UploadCustomDatasetSnapShotAsJson()
    {
        string fileContent;
        var file = Request.Form.Files[0];
        using (var reader = new StreamReader(file.OpenReadStream()))
        {
            fileContent = reader.ReadToEnd();
        }

        try
        {
            _customDatasetSnapShotService.UploadCustomDatasetSnapShotAsJson(fileContent);
            return JsonNet(new { isSuccess = true });
        }
        catch (Exception ex)
        {
            return JsonNet(new { isSuccess = false, message = new List<string> { ex.Message } });
        }
    }

    [HttpGet("GetCustomDatasetSnapShotAsJson/{customDatasetId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetCustomDatasetSnapShotAsJson(string customDatasetId)
    {
        var result = _customDatasetSnapShotService
            .GetCustomDatasetSnapShotAsJson(customDatasetId);

        return Json(result, new Newtonsoft.Json.JsonSerializerSettings());
    }

    [HttpGet("GetCustomDataSetSchemaTableList")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetCustomDataSetSchemaTableList()
    {
        return JsonNet(_customDataSetCrudService.GetCustomDataSetSchemaTableList());
    }

    [HttpGet("GetReferencedCustomDataSetSchemaTableList")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetReferencedCustomDataSetSchemaTableList()
    {
        return JsonNet(_customDataSetCrudService.GetReferencedCustomDataSetSchemaTableList());
    }

    /*[HttpGet("GetPermittedCustomDataset")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetPermittedCustomDataset()
    {
        return JsonNet(_customDataSetCrudService.GetPermittedCustomDataSet());
    }*/

    [HttpPost("GetCustomDatasetColumnValue")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetCustomDatasetColumnValue([FromBody] CustomDatasetColumValueDto customDatasetColumValue)
    {
        return JsonNet(_customDataSetCrudService.GetCustomDatasetColumnValue(customDatasetColumValue));
    }

    [HttpGet("GetTableList")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetTableList(string? schemaName)
    {
        return JsonNet(_customDataSetCrudService.GetAllTableList(schemaName));
    }

    [HttpGet("GetTableListBySchemaName")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult TableListBySchemaName(string? schemaName)
    {
        return JsonNet(_customDataSetCrudService.TableListBySchemaName(schemaName));
    }

    [HttpGet("GetSchemaList")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetSchemaList()
    {
        return JsonNet(_customDataSetCrudService.GetSchemaList());
    }

    [HttpGet("GetById/{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(string id)
    {
        return JsonNet(await _customDataSetCrudService.GetById(id));
    }

    [HttpPost("GetPreviewData")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetPreviewData(Preview preview)
    {
        return JsonNet(_customDataSetCrudService.GetPreviewData(preview.query));
    }

    [HttpPost("Insert")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async  Task<IActionResult> Insert(CustomDataset record)
    {
        return JsonNet(await _customDataSetCrudService.Insert(record));
    }

    [HttpGet("GetAll")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll()
    {
        return JsonNet(await _customDataSetCrudService.GetAll());
    }

    [HttpPost("Update")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(CustomDataset record)
    {
        return JsonNet(await _customDataSetCrudService.Update(record));
    }

    [HttpGet("GetColumnList")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetColumnList(string tableName)
    {
        return JsonNet(_customDataSetCrudService.GetColumnList(tableName));
    }

    [HttpGet("GetColumnListWithType")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetColumnListWithTYpe(string tableName)
    {
        return JsonNet(_customDataSetCrudService.GetColumnListWithType(tableName));
    }

    [HttpGet("GetCustomDataSetSchemaColumnList")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetCustomDataSetSchemaColumnList(string tableName)
    {
        return JsonNet(_customDataSetCrudService.GetCustomDataSetSchemaColumnList(tableName));
    }

    [HttpPost("GetCustomDataSetDropdown")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetCustomDataSetDropdown(CustomDatasetQueryModel customDatasetQueryModel)
    {
        return JsonNet(_customDataSetCrudService.GetCustomDataSetDropdown(customDatasetQueryModel));
    }

    [HttpGet("GetCustomDatasetByName")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public IActionResult GetCustomDatasetByName(string datasetName)
    {
        return JsonNet(_customDataSetCrudService.GetCustomDatasetByName(datasetName));
    }

    [HttpGet("GetReportsOnParticipantEligibleForMicrofinance")]
    public IActionResult GetReportsOnParticipantEligibleForMicrofinance(
        [FromServices] IRawSqlQueryService service)
    {
        var data = service.GetRecords(
            table: "reporttableonparticipanteligibleformicrofinance",
            schema: "customdataset");

        return Ok(data);
    }

    public record Preview(string query);
}
