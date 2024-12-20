namespace visual_db_server.Models;

public class CustomDatasetQueryModel
{
    public string? ValueColumn { get; set; }
    public string? LabelColumn { get; set; }
    public string? DatasetName { get; set; }
    public string? RelationFormula { get; set; }
    public string? SelectedParentAttributeId { get; set; }
    public string? SelectedDisabilityCheckAttributeId { get; set; }
    public Dictionary<string, string>? FilterInfo { get; set; }
}
