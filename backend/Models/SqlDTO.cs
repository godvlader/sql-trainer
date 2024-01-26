using prid_2324_a15.Models;
using MySql.Data.MySqlClient;
using System.Data;
namespace a15.Models;

public class SqlDTO
{
    public string? Sql { get; set; }
    public string? DatabaseName { get; set;}
    public int QuestionId{get;set;}
    public int UserId {get; set;}
    public bool SaveToDatabase { get; set; } = true;

    public SqlDisplayDTO ExecuteQuery()
    {
        // Check if the query string is empty or consists only of whitespace
        if (string.IsNullOrWhiteSpace(this.Sql))
        {
            return new SqlDisplayDTO
            {
                Error = new string[] { "La requête est vide" }
            };
        }

        // Your connection string, replace with actual details
        string connectionString = $"server=localhost;database={this.DatabaseName};uid=root;password=";

        using MySqlConnection connection = new MySqlConnection(connectionString);
        DataTable table = new DataTable();

        try
        {
            connection.Open();
            MySqlCommand command = new MySqlCommand($"SET sql_mode = 'STRICT_ALL_TABLES'; {this.Sql}", connection);
            MySqlDataAdapter adapter = new MySqlDataAdapter(command);
            adapter.Fill(table);
        }
        catch (Exception e)
        {
            // Handle the exception
            Console.WriteLine($"Error: {e.Message}");
            return new SqlDisplayDTO
            {
                Error = new string[] { e.Message }
            }; // Return SqlDisplayDTO with the error message
        }

        // Get column names
        string[] columns = new string[table.Columns.Count];
        for (int i = 0; i < table.Columns.Count; ++i)
        {
            columns[i] = table.Columns[i].ColumnName;
        }

        Console.WriteLine("Columns: ");
        Console.WriteLine(string.Join(", ", columns));

        // Get data
        string[][] data = new string[table.Rows.Count][];
        for (int j = 0; j < table.Rows.Count; ++j)
        {
            data[j] = new string[table.Columns.Count];
            for (int i = 0; i < table.Columns.Count; ++i)
            {
                object value = table.Rows[j][i];
                string str;
                if (value == null)
                    str = "NULL";
                else
                {
                    if (value is DateTime d)
                    {
                        if (d.TimeOfDay == TimeSpan.Zero)
                            str = d.ToString("yyyy-MM-dd");
                        else
                            str = d.ToString("yyyy-MM-dd hh:mm:ss");
                    }
                    else
                        str = value?.ToString() ?? "";
                }
                data[j][i] = str;
            }
        }

        return new SqlDisplayDTO()
        {
            Data = data, 
            ColumnNames = columns, 
            DbName = this.DatabaseName!,
            RowCount = table.Rows.Count
        };
    }

}