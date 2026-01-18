const service = require("../services/country.service");

exports.getAll = async (req, res) => res.json(await service.getAll());
exports.getById = async (req, res) => res.json(await service.getById(req.params.id));
exports.create = async (req, res) => res.status(201).json(await service.create(req.body));
exports.update = async (req, res) => res.json(await service.update(req.params.id, req.body));
exports.delete = async (req, res) => res.json(await service.delete(req.params.id));
