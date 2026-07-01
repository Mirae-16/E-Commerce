const User = require("../models/User");
//CREATE
exports.createUser = async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
};
//GET ALL
exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
//DELETE
exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
};