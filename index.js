const express = require('express');
const cors = require('cors')
const pool = require('./db');
const result = require("pg/lib/query");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

// LIST ALL EVENTS
app.get('/events', async (req, res) => {
    try {
        // Getting all events
        const result = await pool.query("SELECT * FROM events")
        res.status(200).json(result.rows); // 200 = OK
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Database error'}); // 500 = Internal Server Error
    }
})

// CREATE NEW EVENT
app.post('/events', async (req, res) => {
    const { title, description, start_time, end_time } = req.body;  // Destructuring the input data

    try {
        // Insert the event details into a new row in the table
        const result = await pool.query(
            'INSERT INTO events (title, description, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, start_time, end_time]
        );
        res.status(201).json(result.rows[0]); // 201 = Resource Created
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Failed to create event.'}); // 500 = Internal Server Error
    }
})

// LIST DETAILS OF AN EVENT
app.get('/event/:id', async (req, res) => {
    const { id } = req.params; // Destructuring the URL parameters

    try {
        // Get the current event row
        const result = await pool.query('SELECT * FROM events where id = $1', [id]);
        if (result.rows.length === 0) {  // length 0 means no rows returned, i.e. event isn't found
            res.status(404).json({error: 'No event found.'}); // 404 = Resource Not Found
        } else {
            res.status(200).json(result.rows[0]); // 200 = OK
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Database error.'}); // 500 = Internal Server Error
    }
})

// DELETE AN EVENT
app.delete('/event/:id', async (req, res) => {
    const { id } = req.params;  // Destructuring URL parameters

    try {
        // Delete the current event row from the table
        const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {  // length 0 means no rows returned, i.e. event isn't found
            return res.status(404).json({error: 'Event not found.'}); // 404 = Resource Not Found
        }

        res.status(200).json(result.rows[0]); // 200 = OK
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Failed to delete event.'}); // 500 = Internal Server Error
    }
})

// REGISTER IN AN EVENT
app.post('/event/:id/register', async (req, res) => {
    const {id} = req.params;  // Destructuring URL parameters
    const {name, dept, college, country, laptop} = req.body;  // Destructuring input data

    try {
        // Checking if event exists
        const event = await pool.query('SELECT * FROM events where id = $1', [id]);
        if (event.rows.length === 0) {  // length 0 means no rows returned, i.e. event isn't found
            return res.status(404).json({error: 'Event not found.'}); // 404 = Resource Not Found
        }

        // Insert new row for new registration
        const registration = await pool.query(
            'INSERT INTO registrations (event_id, name, dept, college, country, laptop) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, name, dept, college, country, laptop]
        )

        res.status(201).json({msg: 'Registration successful!', result: registration.rows[0]}); // 201 = Resource Created
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Failed to register for event.'}); // 500 = Internal Server Error
    }
})

// LIST ALL REGISTRATIONS IN AN EVENT
app.get('/event/:id/registrations', async (req, res) => {
    const { id } = req.params;  // Destructuring URL parameters

    try {
        // Checking if event exists
        const event = await pool.query('SELECT * FROM events WHERE id = $1', [id])
        if (event.rows.length === 0) {  // length 0 means no rows returned, i.e. event isn't found
            return res.status(404).json({error: 'Event not found.'}); // 404 = Resource Not Found
        }

        // Get all registrations for the particular event
        const regs = await pool.query('SELECT * FROM registrations WHERE event_id = $1', [id])
        if (regs.rows.length === 0) {  // length 0 means no rows returned, i.e. event isn't found
            return res.status(404).json({error: 'No registrations yet.'}); // 404 = Resource Not Found
        }
        res.status(200).json({result: regs.rows}); // 200 = OK
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Failed to list registrations.'}); // 500 = Internal Server Error
    }
})



app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
})