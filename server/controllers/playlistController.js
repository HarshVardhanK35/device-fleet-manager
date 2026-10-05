import Playlist from "../models/Playlist.js";

export const createPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.create(req.body);
    await playlist.populate("contentItems");
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find().populate("contentItems");
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate(
      "contentItems",
    );
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("contentItems");
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
