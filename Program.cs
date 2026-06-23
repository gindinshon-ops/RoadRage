/*
 * Imports basic .NET classes from the System namespace.
 *
 * This file uses System for several important classes, including:
 *
 * - Console, which writes messages to the terminal
 * - Guid, which creates unique login tokens
 * - Exception, which represents errors caught by the server
 */
using System;

/*
 * Imports LINQ, which stands for Language Integrated Query.
 *
 * LINQ provides methods used to search, filter, group, sort, and transform
 * collections and database tables.
 *
 * This file uses LINQ methods such as:
 *
 * - FirstOrDefault()
 * - Any()
 * - GroupBy()
 * - Select()
 * - OrderBy()
 * - Take()
 * - ToList()
 * - Min()
 */
using System.Linq;

/*
 * Imports Entity Framework Core classes.
 *
 * Entity Framework Core is an ORM:
 *
 * ORM means Object-Relational Mapper.
 *
 * It allows the program to work with database tables through C# classes
 * and objects instead of writing SQL manually for every operation.
 *
 * This file specifically uses:
 *
 * - DbSet<T>
 * - AsNoTracking()
 */
using Microsoft.EntityFrameworkCore;

/*
 * Imports the project's custom database utilities.
 *
 * This namespace contains DatabaseCore, which is used as the base class
 * for the Database class defined later in this file.
 */
using Project.DatabaseUtilities;

/*
 * Imports the project's custom logging utilities.
 *
 * This file uses Log.WriteException() to save or display detailed information
 * when an unexpected server error occurs.
 */
using Project.LoggingUtilities;

/*
 * Imports the project's custom server utilities.
 *
 * This namespace provides classes used by the web server, including:
 *
 * - Server
 * - Network
 * - The request object returned by Server.WaitForRequest()
 */
using Project.ServerUtilities;

/*
 * Defines the main Program class.
 *
 * The Program class contains the Main method, which is the starting point
 * of the application.
 */
class Program
{
    /*
     * Main is the method that runs automatically when the program starts.
     *
     * `static` means that Main belongs to the Program class itself.
     * The program does not need to create a Program object before calling it.
     *
     * `void` means that Main does not return a value.
     */
    static void Main()
    {
        /*
         * Stores the TCP port number on which the server will listen.
         *
         * Port 5000 means that the local server address begins with:
         *
         * http://localhost:5000
         */
        int port = 5000;

        /*
         * Creates a new Server object and tells it to use port 5000.
         *
         * The server object is responsible for:
         *
         * - Listening for incoming browser requests
         * - Reading request names and parameters
         * - Sending responses back to the browser
         */
        var server = new Server(port);

        /*
         * Creates an instance of the Database class defined later in this file.
         *
         * The database object provides access to the Users and Records tables.
         *
         * `var` allows C# to determine the variable type automatically.
         * In this case, the type is Database.
         */
        var database = new Database();

        /*
         * Makes sure that the database exists.
         *
         * If the database has not yet been created, Entity Framework creates it
         * using the current database model.
         *
         * The model contains the Users and Records tables defined by:
         *
         * - DbSet<User> Users
         * - DbSet<Record> Records
         *
         * EnsureCreated is convenient for a small learning project.
         * Larger production applications normally use database migrations.
         */
        database.Database.EnsureCreated();

        /*
         * Writes a message to the terminal to confirm that server startup
         * reached this point successfully.
         */
        Console.WriteLine("The server is running");

        /*
         * Displays the local URL that can be opened on the same computer
         * that is running the server.
         *
         * `$"..."` is an interpolated string.
         *
         * It allows the value of `port` to be inserted directly into the text
         * by writing `{port}`.
         *
         * The URL points to:
         *
         * website/pages/index.html
         *
         * which is the starting HTML page of the website.
         */
        Console.WriteLine(
            $"Local: http://localhost:{port}/website/pages/index.html"
        );

        /*
         * Displays the network URL.
         *
         * This URL may be opened by another device connected to the same
         * local network, provided that:
         *
         * - The operating system firewall allows the connection
         * - The devices can communicate with each other
         * - The server accepts network connections
         *
         * Network.GetLocalNetworkIPAddress() gets the local network IP address
         * of the computer running the program.
         *
         * An example result might be:
         *
         * http://192.168.1.20:5000/website/pages/index.html
         */
        Console.WriteLine(
            $"Network: http://{Network.GetLocalNetworkIPAddress()}:{port}/website/pages/index.html"
        );

        /*
         * Starts an infinite server loop.
         *
         * The condition `true` is always true, so the loop continues forever
         * unless:
         *
         * - The application is closed
         * - The process is stopped
         * - An unhandled fatal error terminates the program
         *
         * Each loop iteration waits for and handles one incoming request.
         */
        while (true)
        {
            /*
             * Waits until the server receives a request.
             *
             * When a request arrives, WaitForRequest() returns a request object.
             *
             * That request object contains information such as:
             *
             * - The request name
             * - The request parameters
             * - Methods for returning a response
             * - Methods for setting the HTTP status code
             *
             * Because this call waits for the next request, the server pauses
             * here until a client sends something.
             */
            var request = server.WaitForRequest();

            /*
             * Writes the received request name to the server console.
             *
             * This is useful for debugging and for observing server activity.
             *
             * Example output:
             *
             * Received a request: Login
             */
            Console.WriteLine(
                $"Received a request: {request.Name}"
            );

            /*
             * Starts a try block around the complete request-handling process.
             *
             * Any exception thrown while reading parameters, querying the
             * database, saving data, or creating the response will be caught
             * by the catch block near the end.
             *
             * This prevents one failed request from immediately stopping the
             * entire server application.
             */
            try
            {
                /*
                 * Checks whether the client requested the Login action.
                 *
                 * `==` compares the value of request.Name with the string
                 * "Login".
                 *
                 * This name must match the name sent by the client code:
                 *
                 * send("Login", username, password)
                 */
                if (request.Name == "Login")
                {
                    /*
                     * Reads two string parameters from the request.
                     *
                     * GetParams<(string, string)>() says that the request is
                     * expected to contain a tuple with two string values.
                     *
                     * A tuple is a small group of related values.
                     *
                     * Tuple deconstruction places the first value into:
                     *
                     * username
                     *
                     * and the second value into:
                     *
                     * password
                     *
                     * This corresponds to the client request:
                     *
                     * send("Login", username, password)
                     */
                    var (username, password) =
                        request.GetParams<(string, string)>();

                    /*
                     * Searches the Users database table for a user whose
                     * username and password both match the submitted values.
                     *
                     * database.Users represents the Users table.
                     *
                     * FirstOrDefault() returns:
                     *
                     * - The first matching User object
                     * - null if no matching user exists
                     *
                     * `currentUser` represents each user examined by the query.
                     *
                     * The && operator means "AND".
                     *
                     * Therefore, both conditions must be true:
                     *
                     * 1. The stored username must equal the submitted username.
                     * 2. The stored password must equal the submitted password.
                     *
                     * String comparisons here are case-sensitive unless the
                     * database configuration or collation changes that behavior.
                     */
                    var user = database.Users.FirstOrDefault(
                        currentUser =>
                            currentUser.Username == username &&
                            currentUser.Password == password
                    );

                    /*
                     * Sends the user's token back to the client.
                     *
                     * <string?> means that the response may contain:
                     *
                     * - A string
                     * - null
                     *
                     * `user?.Token` uses the null-conditional operator `?.`.
                     *
                     * It means:
                     *
                     * - If user is not null, return user.Token.
                     * - If user is null, return null.
                     *
                     * Therefore:
                     *
                     * - Correct username and password return a token.
                     * - Incorrect credentials return null.
                     */
                    request.Respond<string?>(user?.Token);
                }

                /*
                 * This branch runs if the request was not Login and its name
                 * is Signup.
                 *
                 * The client sends this request with:
                 *
                 * send("Signup", username, password)
                 */
                else if (request.Name == "Signup")
                {
                    /*
                     * Reads the username and password sent by the signup page.
                     *
                     * Both values are expected to be strings.
                     *
                     * Tuple deconstruction stores them in separate variables.
                     */
                    var (username, password) =
                        request.GetParams<(string, string)>();

                    /*
                     * Checks whether the submitted username is already stored
                     * in the Users table.
                     *
                     * Any() returns a Boolean value:
                     *
                     * - true if at least one matching user exists
                     * - false if no matching user exists
                     *
                     * The result is stored in usernameAlreadyExists.
                     */
                    bool usernameAlreadyExists =
                        database.Users.Any(
                            user => user.Username == username
                        );

                    /*
                     * Runs when the requested username already belongs to
                     * another account.
                     */
                    if (usernameAlreadyExists)
                    {
                        /*
                         * Sends null back to the signup page.
                         *
                         * The frontend interprets null as:
                         *
                         * "A user with that username already exists."
                         *
                         * The explicit type <string?> allows the response to be
                         * either a string or null.
                         */
                        request.Respond<string?>(null);

                        /*
                         * Skips the rest of the current while-loop iteration.
                         *
                         * This prevents the server from creating a duplicate
                         * account.
                         *
                         * The server then returns to the beginning of the loop
                         * and waits for the next request.
                         */
                        continue;
                    }

                    /*
                     * Creates a new unique token for the account.
                     *
                     * Guid.NewGuid() creates a new Globally Unique Identifier.
                     *
                     * ToString() converts that Guid value into a string.
                     *
                     * An example token may look like:
                     *
                     * 98e26d62-cad1-4216-b769-037474ac36d6
                     */
                    string token = Guid.NewGuid().ToString();

                    /*
                     * Creates a new User object.
                     *
                     * The object initializer between { and } assigns values
                     * to the new user's properties.
                     *
                     * At this point, the object exists in application memory
                     * but has not yet been permanently saved to the database.
                     */
                    var user = new User
                    {
                        /*
                         * Stores the submitted username in the new User object.
                         */
                        Username = username,

                        /*
                         * Stores the submitted password in the new User object.
                         *
                         * This code stores the password as plain text.
                         *
                         * In a production system, passwords should be stored
                         * using a secure password-hashing algorithm and should
                         * never be stored directly as readable text.
                         */
                        Password = password,

                        /*
                         * Stores the newly generated authentication token.
                         */
                        Token = token
                    };

                    /*
                     * Adds the new User object to Entity Framework's change
                     * tracker.
                     *
                     * This marks the object for insertion into the Users table.
                     *
                     * It is not permanently written to the database until
                     * SaveChanges() is called.
                     */
                    database.Users.Add(user);

                    /*
                     * Saves all pending Entity Framework changes.
                     *
                     * In this case, it inserts the new user into the database.
                     *
                     * The database normally generates the new user's Id value.
                     */
                    database.SaveChanges();

                    /*
                     * Sends the generated token back to the signup client.
                     *
                     * Because token is a non-null string, C# infers the response
                     * type automatically here.
                     */
                    request.Respond(token);
                }

                /*
                 * This branch handles a request for submitting a new
                 * reaction-time record.
                 *
                 * The client must send:
                 *
                 * - A login token
                 * - A score
                 */
                else if (request.Name == "SubmitRecord")
                {
                    /*
                     * Reads two parameters from the request:
                     *
                     * token:
                     * A string used to identify the logged-in user.
                     *
                     * score:
                     * An integer containing the user's reaction-time result.
                     *
                     * The tuple type is:
                     *
                     * (string, int)
                     */
                    var (token, score) =
                        request.GetParams<(string, int)>();

                    /*
                     * Searches for the user whose stored token matches the
                     * submitted token.
                     *
                     * FirstOrDefault returns:
                     *
                     * - The matching User
                     * - null if the token does not belong to any user
                     *
                     * This allows the server to identify the user without
                     * trusting a username sent directly by the browser.
                     */
                    var user = database.Users.FirstOrDefault(
                        currentUser =>
                            currentUser.Token == token
                    );

                    /*
                     * Checks whether the token was invalid.
                     *
                     * user is null when no account has the submitted token.
                     */
                    if (user == null)
                    {
                        /*
                         * Sends false to the client.
                         *
                         * This informs the client that the record was not
                         * accepted.
                         */
                        request.Respond(false);

                        /*
                         * Stops handling this request and returns to the start
                         * of the server loop.
                         *
                         * No Record object will be created for an invalid token.
                         */
                        continue;
                    }

                    /*
                     * Creates a new Record object in application memory.
                     *
                     * The record stores:
                     *
                     * - The username of the authenticated user
                     * - The submitted score
                     */
                    var record = new Record
                    {
                        /*
                         * Uses the username from the authenticated database user.
                         *
                         * This is safer than accepting a username directly from
                         * the browser because the browser could send a false
                         * username.
                         */
                        Name = user.Username,

                        /*
                         * Stores the submitted score.
                         *
                         * In this project, the score represents reaction time.
                         * A smaller number represents a faster result.
                         */
                        Score = score
                    };

                    /*
                     * Adds the new Record object to Entity Framework's change
                     * tracker.
                     *
                     * It is now marked for insertion into the Records table.
                     */
                    database.Records.Add(record);

                    /*
                     * Writes the new record permanently to the database.
                     */
                    database.SaveChanges();

                    /*
                     * Sends true to the client to confirm that the score was
                     * accepted and saved successfully.
                     */
                    request.Respond(true);
                }

                /*
                 * This branch handles requests for the leaderboard records.
                 *
                 * It does not require any request parameters.
                 */
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

                    /*
                     * Begins a database query using the Records table.
                     *
                     * The complete query creates a top-ten leaderboard where
                     * every username appears only once, using that user's
                     * fastest reaction time.
                     */
                    var bestRecords = database.Records

                        /*
                         * Tells Entity Framework not to track the returned
                         * Record objects for future changes.
                         *
                         * Tracking is not needed because this query only reads
                         * data and does not modify the returned records.
                         *
                         * AsNoTracking can reduce memory use and improve
                         * performance for read-only queries.
                         */
                        .AsNoTracking()

                        /*
                         * Groups all records according to their Name property.
                         *
                         * All records with the same username are placed in
                         * the same group.
                         *
                         * For example, records for "Nick" would be grouped
                         * together separately from records for "John".
                         */
                        .GroupBy(record => record.Name)

                        /*
                         * Transforms each username group into a new result object.
                         *
                         * The result contains only:
                         *
                         * - username
                         * - bestTime
                         */
                        .Select(group => new
                        {
                            /*
                             * group.Key contains the value used to create the
                             * group.
                             *
                             * Since records were grouped by record.Name,
                             * group.Key contains the username.
                             *
                             * The property name is intentionally lowercase:
                             *
                             * username
                             *
                             * This affects the shape of the object sent to the
                             * frontend.
                             */
                            username = group.Key,

                            /*
                             * Finds the smallest Score value inside this user's
                             * group of records.
                             *
                             * Min() is used because a smaller reaction time is
                             * better.
                             *
                             * The resulting property is named bestTime.
                             */
                            bestTime = group.Min(
                                record => record.Score
                            )
                        })

                        /*
                         * Sorts the result objects by bestTime in ascending order.
                         *
                         * Ascending numerical order means:
                         *
                         * - The smallest reaction time comes first.
                         * - The largest reaction time comes last.
                         *
                         * Therefore, the fastest player appears at the top.
                         */
                        .OrderBy(record => record.bestTime)

                        /*
                         * Keeps only the first ten results after sorting.
                         *
                         * This creates a top-ten leaderboard.
                         *
                         * If fewer than ten users have records, all available
                         * users are returned.
                         */
                        .Take(10)

                        /*
                         * Executes the database query and stores the results
                         * in a List.
                         *
                         * Before ToList(), the query is only being constructed.
                         *
                         * ToList() causes Entity Framework to send the query
                         * to the database and retrieve the actual results.
                         */
                        .ToList();

                    /*
                     * Sends the top-ten leaderboard back to the client.
                     *
                     * The server utilities serialize bestRecords into a format
                     * that the frontend can receive, normally JSON.
                     */
                    request.Respond(bestRecords);
                }

                /*
                 * This branch handles every request name that was not recognized
                 * by the earlier Login, Signup, SubmitRecord, or GetRecords
                 * conditions.
                 */
                else
                {
                    /*
                     * Changes the HTTP response status code to 404.
                     *
                     * HTTP 404 means "Not Found".
                     *
                     * Here, it means that the requested server action does not
                     * exist.
                     */
                    request.SetStatusCode(404);

                    /*
                     * Sends a response containing the unknown request name.
                     *
                     * This helps the developer identify misspelled or unsupported
                     * request names.
                     */
                    request.Respond(
                        $"Unknown request: {request.Name}"
                    );
                }
            }

            /*
             * Catches any Exception thrown while processing the current request.
             *
             * The exception variable contains information about the error,
             * including its message and stack trace.
             *
             * Because this catch is inside the while loop, the server can
             * report the error and then continue waiting for future requests.
             */
            catch (Exception exception)
            {
                /*
                 * Changes the HTTP response status code to 500.
                 *
                 * HTTP 500 means "Internal Server Error".
                 *
                 * It tells the client that the request reached the server,
                 * but the server encountered an unexpected problem.
                 */
                request.SetStatusCode(500);

                /*
                 * Sends the complete exception to the project's logging system.
                 *
                 * This allows technical information to be saved for debugging
                 * without exposing all internal details to the client.
                 */
                Log.WriteException(exception);

                /*
                 * Sends a simple error message back to the client.
                 *
                 * The raw exception is not returned because it may contain
                 * confusing or sensitive internal information.
                 */
                request.Respond("Server error");
            }
        }
    }
}

/*
 * Defines the application's Entity Framework database context.
 *
 * Database inherits from DatabaseCore.
 *
 * The colon means:
 *
 * Database is derived from DatabaseCore.
 *
 * DatabaseCore likely contains the shared Entity Framework configuration
 * required by this project.
 */
class Database : DatabaseCore
{
    /*
     * Defines the Database constructor.
     *
     * A constructor runs whenever this code creates a new Database object:
     *
     * var database = new Database();
     *
     * `: base("database")` calls the DatabaseCore constructor and passes it
     * the string "database".
     *
     * That string may be used as:
     *
     * - The database file name
     * - The connection name
     * - A database configuration identifier
     *
     * The exact behavior depends on the DatabaseCore implementation.
     */
    public Database() : base("database")
    {
        /*
         * The constructor body is empty because the required initialization
         * is handled by the base-class constructor.
         */
    }

    /*
     * Represents the Users table in the database.
     *
     * DbSet<User> tells Entity Framework that each row in this table is
     * represented by a User object.
     *
     * This property allows operations such as:
     *
     * - database.Users.Add(...)
     * - database.Users.Any(...)
     * - database.Users.FirstOrDefault(...)
     */
    public DbSet<User> Users { get; set; }

        /*
         * `default!` initializes the property with its default value while
         * telling C#'s nullable-reference analysis not to report a warning.
         *
         * Entity Framework assigns the real DbSet value when the database
         * context is initialized.
         *
         * The exclamation mark is the null-forgiving operator.
         */
        = default!;

    /*
     * Represents the Records table in the database.
     *
     * Each row in the Records table is represented by a Record object.
     */
    public DbSet<Record> Records { get; set; }

        /*
         * Entity Framework initializes this DbSet at runtime.
         *
         * `default!` prevents a compiler warning about the property not being
         * assigned directly in the constructor.
         */
        = default!;
}

/*
 * Defines the C# model used for rows in the Users database table.
 *
 * Entity Framework uses this class to determine the table's columns.
 *
 * Each property normally becomes a database column.
 */
class User
{
    /*
     * Stores the numeric primary key of the user.
     *
     * By Entity Framework naming convention, a property named Id is normally
     * recognized automatically as the table's primary key.
     *
     * The database commonly generates this value automatically when a new
     * user is inserted.
     */
    public int Id { get; set; }

    /*
     * Stores the user's authentication token.
     *
     * The server gives this token to the client after successful signup
     * or login.
     *
     * The client sends the token when it needs to prove which account is
     * making a request.
     */
    public string Token { get; set; }

        /*
         * Initializes Token as an empty string.
         *
         * This prevents it from initially being null and satisfies C#'s
         * nullable-reference checking.
         */
        = "";

    /*
     * Stores the account's username.
     */
    public string Username { get; set; }

        /*
         * Gives Username an initial empty-string value instead of null.
         */
        = "";

    /*
     * Stores the account's password.
     *
     * In this current learning-project code, the password is stored directly.
     *
     * A production application should never store passwords as plain text.
     * It should store a salted password hash created by a secure password
     * hashing algorithm.
     */
    public string Password { get; set; }

        /*
         * Gives Password an initial empty-string value instead of null.
         */
        = "";
}

/*
 * Defines the C# model used for rows in the Records database table.
 *
 * Each Record object represents one submitted reaction-time result.
 */
class Record
{
    /*
     * Stores the numeric primary key of the record.
     *
     * Entity Framework recognizes Id as the primary key by convention.
     *
     * The database normally generates it automatically when the record
     * is inserted.
     */
    public int Id { get; set; }

    /*
     * Stores the username belonging to this reaction-time record.
     *
     * The server copies this value from the authenticated User object when
     * the score is submitted.
     */
    public string Name { get; set; }

        /*
         * Initializes Name with an empty string so that it is not null.
         */
        = "";

    /*
     * Stores the numerical reaction-time score.
     *
     * A smaller Score value represents a faster reaction time and is therefore
     * better for the leaderboard.
     */
    public int Score { get; set; }
}