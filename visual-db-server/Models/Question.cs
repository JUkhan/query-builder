namespace visual_db_server.Models;

public class Question
{
    public string? DataElementId { get; set; }
    public string? FieldType { get; set; }
    public bool EnableUniquenessCheckOnAnswer { get; set; } = false;
    public RepeterSectionConfig? RepeaterSectionConfig { get; set; }
    public Title Titles { get; set; } = new();
    public LinkedItem? linkedItem { get; set; }
    public List<Question> Items { get; set; } = new List<Question>();
}

public class RepeterSectionConfig
{
    public bool? IsRepeater { get; set; }
    public bool? IsTabularView { get; set; }
    public string? LinkDataElementId { get; set; }
    public string? RepeaterLabelDataElementId { get; set; }
    public string? RepeaterSectionId { get; set; }
    public string? DbTableName { get; set; }
    public List<List<string>> UniqueConstraintAttributes { get; } = new();
}

public class Title
{
    public string? Default { get; set; }
}

public class LinkedItem
{
    public ItemInfo? ItemInfo { get; set; }
}

public class ItemInfo
{
    public string? CustomDatasetId { get; set; }
}