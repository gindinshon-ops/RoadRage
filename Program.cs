using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Project.DatabaseUtilities;
using Project.LoggingUtilities;
using Project.ServerUtilities;

class Program
{
  static void Main()
  {
    int port = 5000;

    var server = new Server(port);
    var database = new Database();

    Console.WriteLine("The server is running");
    Console.WriteLine($"Local:   http://localhost:{port}/website/pages/index.html");
    Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/index.html");

    while (true)
    {
      var request = server.WaitForRequest();

      Console.WriteLine($"Recieved a request: {request.Name}");

      try
      {
        if (request.Name == "submitRecord")
        {
          var (name, score) = request.GetParams<(string, int)>();
          var record = new Record(name, score);
          database.Records.Add(record);
          database.SaveChanges();
        }
        if (request.Name == "getRecords")
        {
          var records = database.Records.OrderBy(record => -record.Score);

          request.Respond(records);
        }
      }
      catch (Exception exception)
      {
        request.SetStatusCode(500);
        Log.WriteException(exception);
      }
    }
  }
}

class Database() : DatabaseCore("database")
{
  public DbSet<Record> Records { get; set; } = default!;
}

class Record(string name, int score)
{
  public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public int Score { get; set; } = score;
}