namespace prid_2324_a15.Models;

public class SqlDisplayDTO{
    public string[] Error{get;set;} = new string[0];
    public string CorrectMessage{get;set;} = "";
    public string[] ColumnNames{get;set;} = new string[0];
    public string[][] Data{get;set;} = new string[0][];
    public string DbName{get; set;}="";
    public string[] Solutions{get;set;} = new string[0];
    public int RowCount { get; set; } = 0;
    


    public SqlDisplayDTO CheckQueries(SqlDisplayDTO solutionQuery)
    {
        List<string> errors = new();

        // Check for the number of columns in each row
        if (this.Data.Any(row => row.Length != solutionQuery.Data[0].Length)) // Assuming all rows in solutionQuery have the same number of columns
        {
            errors.Add("nombre de colonnes incorrect");
        }

        // Check for the number of rows
        if (this.Data.Length != solutionQuery.Data.Length)
        {
            errors.Add("nombre incorrect pour les lignes");
        }

        // If the number of columns and rows are correct, then check for data accuracy
        if (!errors.Any())
        {
            string[] userArray = this.Data.SelectMany(row => row).ToArray();
            string[] solutionArray = solutionQuery.Data.SelectMany(row => row).ToArray();

            if (!userArray.SequenceEqual(solutionArray))
            {
                errors.Add("Incorrect data");
            }
        }

        // Set the correct message or error message
        if (!errors.Any())
        {
            this.CorrectMessage = "Votre requête a retourné une réponse correcte !" +
                                "<br><br> Néanmoins, comparez votre solution avec celle(s) ci-dessous pour voir si vous n'avez pas eu un peu de chance :)";
        }
        else
        {
            this.Error = errors.ToArray();
        }

        return this;
    }


}