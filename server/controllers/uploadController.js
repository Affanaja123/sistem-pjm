const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

exports.handleUpload = (req, res) => {
    try {
        if (req.file) {
            return res.json({ status: 'success', success: true, file: req.file.filename, path: req.file.filename });
        }
        if (req.body.base64Image) {
            const matches = req.body.base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const extension = (matches[1].split('/')[1] || 'jpg').replace('jpeg', 'jpg');
                const filename = `img_${Date.now()}.${extension}`;
                fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(matches[2], 'base64'));
                return res.json({ status: 'success', success: true, file: filename, path: filename });
            }
        }
        return res.status(400).json({ status: 'error', success: false, message: 'No file or valid base64 provided' });
    } catch (err) {
        res.status(500).json({ status: 'error', success: false, message: err.message });
    }
};
