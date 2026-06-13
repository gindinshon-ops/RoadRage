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

        Console.WriteLine(
            $"Local: http://localhost:{port}/website/pages/index.html"
        );

        Console.WriteLine(
            $"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/index.html"
        );

        while (true)
        {
            var request = server.WaitForRequest();

            Console.WriteLine(
                $"Received a request: {request.Name}"
            );

            try
            {
                if (request.Name == "Login")
                {
                    var (username, password) =
                        request.GetParams<(string, string)>();

                    var user = database.Users.FirstOrDefault(
                        currentUser =>
                            currentUser.Username == username &&
                            currentUser.Password == password
                    );

                    request.Respond<string?>(user?.Token);
                }

                else if (request.Name == "Signup")
                {
                    var (username, password) =
                        request.GetParams<(string, string)>();

                    bool usernameAlreadyExists =
                        database.Users.Any(
                            user => user.Username == username
                        );

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

                else if (request.Name == "SubmitRecord")
                {
                    var (token, score) =
                        request.GetParams<(string, int)>();

                    var user = database.Users.FirstOrDefault(
                        currentUser =>
                            currentUser.Token == token
                    );

                    if (user == null)
                    {
                        request.Respond(false);
                        continue;
                    }

                    var record = new Record
                    {
                        Name = user.Username,
                        Score = score
                    };

                    database.Records.Add(record);
                    database.SaveChanges();

                    request.Respond(true);
                }

                else if (request.Name == "GetRecords")
                {
                    /*
                     * Group all records by username.
                     *
                     * For every user, select their smallest score.
                     * A smaller reaction time is better.
                     *
                     * The results are sorted from fastest to slowest.
                     */
                    var bestRecords = database.Records
                        .AsNoTracking()
                        .GroupBy(record => record.Name)
                        .Select(group => new
                        {
                            username = group.Key,
                            bestTime = group.Min(
                                record => record.Score
                            )
                        })
                        .OrderBy(record => record.bestTime)
                        .Take(10)
                        .ToList();

                    request.Respond(bestRecords);
                }

                else
                {
                    request.SetStatusCode(404);

                    request.Respond(
                        $"Unknown request: {request.Name}"
                    );
                }
            }
            catch (Exception exception)
            {
                request.SetStatusCode(500);

                Log.WriteException(exception);

                request.Respond("Server error");
            }
        }
    }
}

class Database : DatabaseCore
{
    public Database() : base("database")
    {
    }

    public DbSet<User> Users { get; set; }
        = default!;

    public DbSet<Record> Records { get; set; }
        = default!;
}

class User
{
    public int Id { get; set; }

    public string Token { get; set; }
        = "";

    public string Username { get; set; }
        = "";

    public string Password { get; set; }
        = "";
}

class Record
{
    public int Id { get; set; }

    public string Name { get; set; }
        = "";

    public int Score { get; set; }
}