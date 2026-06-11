using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text.Json.Serialization;
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

        if (request.Name == "Login")
        {
          var (username, password) = request.GetParams<(string, string)>();

          var user = database.Users.FirstOrDefault(u => u.Username == username && u.Password == password);

          request.Respond(user?.Token);
        }

        else if (request.Name == "Signup")
        {
          var (username, password) = request.GetParams<(string, string)>();

          if (database.Users.Any(u => u.Username == username))
          {
            request.Respond<string?>(null);
            continue;
          }

          var token = Guid.NewGuid().ToString();
          var user = new User(username, password, token);

          database.Users.Add(user);
          database.SaveChanges();

          request.Respond(token);
        }










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
  public DbSet<User> Users { get; set; } = default!;
  public DbSet<Record> Records { get; set; } = default!;

}

class Record(string name, int score)
{
  public int Id { get; set; } = default!;
  public string Name { get; set; } = name;
  public int Score { get; set; } = score;
}

class User(string username, string password, string token)
{
  public int Id { get; set; } = default!;
  public string Token { get; set; } = token;

  public string Username { get; set; } = username;
  public string Password { get; set; } = password;
}

