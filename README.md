# Gatherly
<b>Gatherly</b> is a simple, customizable event scheduling API built with <b>Express</b> and <b>PostgreSQL</b>. It allows users to create events, register participants, and retrieve event details with ease. Automatic cleanup of expired events helps keep your database tidy!

### Features
- Create and store events with start and end times, descriptions and more details.
- Fetch all events or just one individual event.
- Register users to events with specific details. You may change these as you wish, by creating the table as required.
- Automatically delete expired events and registrations related to them.

### Setup
#### Prerequisites
- Node.js and npm installed on your computer.
- A project on Supabase's free tier to use PostgreSQL database.

#### Installation
1. Clone the repository.<br>
   `
   git clone https://github.com/xerctia/gatherly`<br>
   `cd gatherly
   `<br><br>
2. Install dependencies.<br>
   `npm install`<br><br>
3. Setup environment variables in .env file:<br>
   `
   DATABASE_URL=your_supabase_database_url
   NODE_TLS_REJECT_UNAUTHORIZED=0
   `<br>
   <b>Note:</b> Replace your_supabase_database_url with your actual Supabase Postgres URL. You can find it in the project settings under Database tab.<br><br>
4. Create tables in Supabase according to the rows you need, and update queries in index.js accordingly.<br><br>
5. Run the server.<br>
   `npm run start`<br><br>
The server should start at http://localhost:3000 by default.

### API Endpoints
- <b>GET /events</b>: Fetch all events.
- <b>GET /event/:id</b>: Fetch details of event with ID=id.
- <b>POST /events</b>: Create a new event.
- <b>DELETE /event/:id</b>: Delete event with ID=id.
- <b>POST /event/:id/register</b>: Register user details for an event (ID=id).
- <b>GET /event/:id/registrations</b>: List all registrations for the specified event (ID=id).

### Automatic Cleanup
To implement the feature of automatically deleting expired events and registrations, follow the steps below:<br><br>
1. Go to the SQL Editor in Supabase project dashboard.<br><br>
2. Enter this code and run it:<br>`CREATE EXTENSION pg_cron;`<br><br>
3. Now to create the cron job, run this query in the SQL Editor:<br>
   `
   SELECT cron.schedule('0 0 * * 1', $$
   DELETE FROM registrations WHERE event_id IN (SELECT id FROM events WHERE end_time < NOW());
   DELETE FROM events WHERE end_time < NOW();
   $$);
   `<br><br>
4. Customize the schedule as per your needs. The last number (here, 1) represents the day of the week. The above query will run every Monday (1=Monday). Similarly you may assign it to run on any other day.

### License
This project is licensed under MIT License.
