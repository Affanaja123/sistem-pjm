const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

router.post('/auth/login', contentController.login);

// Compatibility middleware for legacy PHP endpoints
router.use((req, res, next) => {
    if (req.url.includes('.php')) {
        const urlParts = req.url.split('?');
        let pathname = urlParts[0].replace(/^\//, '');
        const queryStr = urlParts[1] ? `?${urlParts[1]}` : '';

        let targetModule = '';
        let isDelete = false;
        let isPost = false;
        let isGet = false;

        switch (pathname) {
            case 'login.php':
                req.url = `/login${queryStr}`;
                break;
            case 'register.php':
                req.url = `/register${queryStr}`;
                break;
            case 'upload_file.php':
                req.url = `/upload${queryStr}`;
                break;
            case 'download.php':
                req.url = `/download${queryStr}`;
                break;

            case 'get_menus.php':
            case 'get_menus_admin.php':
                targetModule = 'cms-menus';
                isGet = true;
                break;
            case 'save_menus.php':
                targetModule = 'cms-menus';
                isPost = true;
                break;

            case 'get_admin_konten.php':
                targetModule = 'admin-konten';
                isGet = true;
                break;
            case 'add_admin_konten_user.php':
            case 'update_admin_konten.php':
                targetModule = 'admin-konten';
                isPost = true;
                break;
            case 'delete_admin_konten.php':
                targetModule = 'admin-konten';
                isDelete = true;
                break;

            case 'get_berita.php':
            case 'get_detail_berita.php':
                targetModule = 'berita';
                isGet = true;
                break;
            case 'save_berita.php':
            case 'save_detail_berita.php':
                targetModule = 'berita';
                isPost = true;
                break;
            case 'delete_berita.php':
                targetModule = 'berita';
                isDelete = true;
                break;

            case 'get_pelaporan.php':
                targetModule = 'pelaporan';
                isGet = true;
                break;
            case 'save_pelaporan.php':
                targetModule = 'pelaporan';
                isPost = true;
                break;

            case 'get_sistem_info.php':
                targetModule = 'sistem-informasi';
                isGet = true;
                break;
            case 'save_sistem_info.php':
                targetModule = 'sistem-informasi';
                isPost = true;
                break;

            case 'get_konsultasi.php':
                targetModule = 'konsultasi-mutu';
                isGet = true;
                break;
            case 'save_konsultasi.php':
                targetModule = 'konsultasi-mutu';
                isPost = true;
                break;

            case 'get_visi_misi.php':
                targetModule = 'visi-misi';
                isGet = true;
                break;
            case 'save_visi_misi.php':
                targetModule = 'visi-misi';
                isPost = true;
                break;

            case 'get_tupoksi.php':
                targetModule = 'tupoksi';
                isGet = true;
                break;
            case 'save_tupoksi.php':
                targetModule = 'tupoksi';
                isPost = true;
                break;

            case 'get_sambutan.php':
                targetModule = 'sambutan-rektor';
                isGet = true;
                break;
            case 'save_sambutan.php':
                targetModule = 'sambutan-rektor';
                isPost = true;
                break;

            case 'get_organisasi.php':
                targetModule = 'organisasi';
                isGet = true;
                break;
            case 'save_organisasi.php':
                targetModule = 'organisasi';
                isPost = true;
                break;

            case 'get_spme.php':
                targetModule = 'spme';
                isGet = true;
                break;
            case 'save_spme.php':
                targetModule = 'spme';
                isPost = true;
                break;

            case 'get_spmi.php':
                targetModule = 'spmi';
                isGet = true;
                break;
            case 'save_spmi.php':
                targetModule = 'spmi';
                isPost = true;
                break;

            case 'get_peraturan.php':
                targetModule = 'peraturan-uud';
                isGet = true;
                break;
            case 'save_peraturan.php':
                targetModule = 'peraturan-uud';
                isPost = true;
                break;

            case 'get_pustaka.php':
                targetModule = 'pustaka';
                isGet = true;
                break;
            case 'save_pustaka.php':
                targetModule = 'pustaka';
                isPost = true;
                break;

            case 'get_evaluasi.php':
                targetModule = 'evaluasi';
                isGet = true;
                break;
            case 'save_evaluasi.php':
                targetModule = 'evaluasi';
                isPost = true;
                break;

            case 'get_pengumuman.php':
                targetModule = 'pengumuman';
                isGet = true;
                break;
            case 'save_pengumuman.php':
                targetModule = 'pengumuman';
                isPost = true;
                break;
            case 'delete_pengumuman.php':
                targetModule = 'pengumuman';
                isDelete = true;
                break;

            case 'get_content.php':
                targetModule = 'cms-contents';
                isGet = true;
                break;
            case 'save_content.php':
                targetModule = 'cms-contents';
                isPost = true;
                break;
        }

        if (targetModule) {
            if (isDelete) {
                const id = req.body && req.body.id ? req.body.id : req.query.id;
                req.method = 'DELETE';
                req.url = id ? `/${targetModule}/${id}` : `/${targetModule}`;
            } else if (isPost) {
                req.method = 'POST';
                req.url = `/${targetModule}${queryStr}`;
            } else if (isGet) {
                req.method = 'GET';
                req.url = `/${targetModule}${queryStr}`;
            }
        }
    }
    next();
});

router.post('/login', contentController.login);
router.post('/register', contentController.register);
router.post('/upload', upload.single('file'), uploadController.handleUpload);
router.get('/download', (req, res) => {
    const file = path.basename(String(req.query.file || ''));
    if (!file) return res.status(400).json({ status: 'error', message: 'File tidak valid' });

    const candidates = [
        path.join(__dirname, '../../uploads', file),
        path.join(__dirname, '../uploads', file)
    ];
    const target = candidates.find(candidate => fs.existsSync(candidate));
    if (!target) return res.status(404).json({ status: 'error', message: 'File tidak ditemukan' });

    res.download(target);
});

router.get('/:module', contentController.getAll);
router.post('/:module', upload.any(), contentController.createOrUpdate);
router.put('/:module/:id', contentController.createOrUpdate);
router.delete('/:module/:id', contentController.remove);
router.delete('/content/:module/:id', contentController.remove);

module.exports = router;
