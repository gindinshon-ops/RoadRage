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

    database.Database.EnsureCreated();

    Console.WriteLine("The server is running");
    Console.WriteLine($"Local:   http://localhost:{port}/website/pages/login.html");
    Console.WriteLine($"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/login.html");

    while (true)
    {
      var request = server.WaitForRequest();

      Console.WriteLine($"Received a request: {request.Name}");

      try
      {
        if (request.Name == "Login")
        {
          var (username, password) = request.GetParams<(string, string)>();

          var user = database.Users.FirstOrDefault(user =>
            user.Username == username &&
            user.Password == password
          );

          request.Respond<string?>(user?.Token);
        }

        else if (request.Name == "Signup")
        {
          var (username, password) = request.GetParams<(string, string)>();

          bool usernameAlreadyExists = database.Users.Any(user => user.Username == username);

          if (usernameAlreadyExists)
          {
            request.Respond<string?>(null);
            continue;
          }

          string token = Guid.NewGuid().ToString();

          var user = new User
          {
            Username = username,
            Password = password,
            Token = token
          };

          database.Users.Add(user);
          database.SaveChanges();

          request.Respond(token);
        }

        else if (request.Name == "SubmitRecord" || request.Name == "submitRecord")
        {
          var (name, score) = request.GetParams<(string, int)>();

          var record = new Record
          {
            Name = name,
            Score = score
          };

          database.Records.Add(record);
          database.SaveChanges();

          request.Respond(true);
        }

        else if (request.Name == "GetRecords" || request.Name == "getRecords")
        {
          var records = database.Records
            .OrderBy(record => record.Score)
            .ToList();

          request.Respond(records);
        }

        else
        {
          request.SetStatusCode(404);
          request.Respond($"Unknown request: {request.Name}");
        }
      }
      catch (Exception exception)
      {
        request.SetStatusCode(500);
        request.Respond("Server error");
        Log.WriteException(exception);
      }
    }
  }
}

class Database : DatabaseCore
{
  public Database() : base("database")
  {
  }

  public DbSet<User> Users { get; set; } = default!;
  public DbSet<Record> Records { get; set; } = default!;
}

class User
{
  public int Id { get; set; }
  public string Token { get; set; } = "";
  public string Username { get; set; } = "";
  public string Password { get; set; } = "";
}

class Record
{
  public int Id { get; set; }
  public string Name { get; set; } = "";
  public int Score { get; set; }
}