const express = require('express');
const { Playlist, Song } = require('../db');

const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// Helper functions
function isYouTubeURL(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regex.test(url);
}

function extractYouTubeID(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// playlist.ejs Routes

// Get all playlists for the authenticated user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const playlists = await Playlist.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Song, as: 'songs' }],
        });
        res.render('playlists', { user: req.user, playlists });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create a new playlist
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        await Playlist.create({
            user_id: req.user.id,
            name,
        });
        res.redirect('/playlists');
    } catch (err) {
        console.error('Error creating playlist:', err);
        res.status(500).send('Server Error');
    }
});

// Delete a playlist
router.post('/:id/delete', isAuthenticated, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!playlist) {
            return res.status(404).send('Playlist not found');
        }
        await playlist.destroy();
        res.redirect('/playlists');
    } catch (err) {
        console.error('Error deleting playlist:', err);
        res.status(500).send('Server Error');
    }
});

// Get the edit playlist view
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, user_id: req.user.id },
            include: [{ model: Song, as: 'songs' }],
        });
        if (!playlist) {
            return res.status(404).send('Playlist not found');
        }
        res.render('editPlaylist', { user: req.user, playlist });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get the view playlist view
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, user_id: req.user.id },
            include: [{ model: Song, as: 'songs' }],
        });
        if (!playlist) {
            return res.status(404).send('Playlist not found');
        }
        res.render('viewPlaylist', { user: req.user, playlist });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// viewPlaylist.ejs Routes

// Get the song details for the given song ID
router.get('/:id/songs/:songId', isAuthenticated, async (req, res) => {
    try {
        const song = await Song.findOne({
            where: { id: req.params.songId, playlist_id: req.params.id },
        });
        if (!song) {
            return res.status(404).send('Song not found');
        }
        res.render('songDetails', { user: req.user, song });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// editPlaylist.ejs Routes

// Add a song to the playlist
router.post('/:id/add-song', isAuthenticated, async (req, res) => {
    try {
        const { title, artist, url, picture } = req.body;
        const playlist = await Playlist.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!playlist) {
            return res.status(404).send('Playlist not found');
        }
        await Song.create({
            playlist_id: playlist.id,
            title,
            artist,
            url,
            picture,
        });
        res.status(200).send('Song added successfully');
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Edit a song in the playlist
router.post('/:id/edit-song/:songId', isAuthenticated, async (req, res) => {
    try {
        const { title, artist, url } = req.body;
        const song = await Song.findOne({
            where: { id: req.params.songId, playlist_id: req.params.id },
        });
        if (!song) {
            return res.status(404).send('Song not found');
        }
        await song.update({ title, artist, url });
        res.redirect(`/playlists/${req.params.id}/edit`);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Delete a song from the playlist
router.post('/:id/delete-song/:songId', isAuthenticated, async (req, res) => {
    try {
        const song = await Song.findOne({
            where: { id: req.params.songId, playlist_id: req.params.id },
        });
        if (!song) {
            return res.status(404).send('Song not found');
        }
        await song.destroy();
        res.redirect(`/playlists/${req.params.id}/edit`);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;