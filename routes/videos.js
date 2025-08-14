const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const {GridFSBucket} = require("mongodb");
const {Readable} = require("stream");

const router = express.Router();
// router.options("/upload", (req, res) => {
// 	res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader("Access-Control-Allow-Methods", "POST");
// 	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
// 	res.status(200).end();
// });

// const validateFile = (req, res, next) => {
// 	if (!req.file) return res.status(400).json({error: "No file provided"});
// 	if (req.file.size > 100 * 1024 * 1024) {
// 		// 100MB limit
// 		return res.status(400).json({error: "File too large"});
// 	}
// 	if (!req.file.mimetype.startsWith("video/")) {
// 		return res.status(400).json({error: "Only video files are allowed"});
// 	}
// 	next();
// };

const {ObjectId} = mongoose.Types;
const conn = mongoose.connection;

const storage = multer.memoryStorage();
const upload = multer({storage});

let gfsBucket;

conn.once("open", () => {
	console.log("MongoDB connected - GridFSBucket ready");
	gfsBucket = new GridFSBucket(conn.db, {
		bucketName: "videos",
	});
});

router.get("/:id", async (req, res) => {
	res.set({
		"Cache-Control": "public, max-age=3600",
		"Content-Type": "video/mp4",
		"Accept-Ranges": "bytes",
		Connection: "keep-alive",
		"Keep-Alive": `timeout=${5 * 60 * 1000}`,
	});
	try {
		let fileId;
		try {
			fileId = new ObjectId(req.params.id);
		} catch (idErr) {
			return res.status(400).json({error: "Invalid video ID format"});
		}

		const fileDoc = await conn.db.collection("videos.files").findOne({_id: fileId});
		if (!fileDoc) {
			return res.status(404).json({error: "File not found"});
		}

		res.set("Content-Type", "video/mp4");

		if (fileDoc.length) {
			res.setHeader("Content-Length", fileDoc.length);
		}

		const downloadStream = gfsBucket.openDownloadStream(fileId);

		downloadStream.on("error", (err) => {
			if (!res.headersSent) {
				res.status(500).json({error: "Error streaming video"});
			}
		});

		downloadStream.pipe(res);
	} catch (err) {
		if (!res.headersSent) {
			res.status(500).json({error: "Server error"});
		}
	}
});

// העלאת וידאו
router.post("/upload", upload.single("file"), (req, res) => {
	if (!gfsBucket) return res.status(500).send("GridFSBucket not initialized");

	const readableStream = Readable.from(req.file.buffer);

	const uploadStream = gfsBucket.openUploadStream(
		`video-${Date.now()}-${req.file.originalname}`,
		{
			contentType: req.file.mimetype,
		},
	);

	readableStream
		.pipe(uploadStream)
		.on("error", (err) => {
			console.error("Upload error:", err);
			res.status(500).send("Upload failed");
		})
		.on("finish", () => {
			res.status(201).json({
				message: "Video uploaded successfully",
				fileId: uploadStream.id,
			});
		});
});

router.get("/", async (req, res) => {
	try {
		const files = await conn.db.collection("videos.files").find().toArray();

		if (!files || files.length === 0) {
			return res.status(404).json({error: "No files found"});
		}

		res.status(200).json(files);
	} catch (error) {
		console.error(error);
		res.status(500).json({error: "Server error"});
	}
});

module.exports = router;
