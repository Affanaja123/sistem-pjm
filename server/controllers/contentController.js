const Models = require('../models');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const uploadDir1 = path.join(__dirname, '../../uploads');
const uploadDir2 = path.join(__dirname, '../uploads');
[uploadDir1, uploadDir2].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

function getModel(name) {
    const map = {
        'admin-konten': Models.AdminKonten,
        'berita': Models.Berita,
        'cms-contents': Models.CmsContent,
        'cms-menus': Models.CmsMenu,
        'evaluasi': Models.Evaluasi,
        'pengumuman': Models.Pengumuman,
        'peraturan-uud': Models.PeraturanUud,
        'pustaka': Models.Pustaka,
        'organisasi': Models.Organisasi,
        'sambutan-rektor': Models.SambutanRektor,
        'spmi': Models.Spmi,
        'spme': Models.Spme,
        'tupoksi': Models.Tupoksi,
        'visi-misi': Models.VisiMisi,
        'layanan-mutu': Models.LayananMutu,
        'pelaporan': Models.ContentPelaporan,
        'sistem-informasi': Models.ContentSistemInfo,
        'konsultasi-mutu': Models.ContentKonsultasiMutu
    };
    return map[name];
}

function normalizeDoc(doc) {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : { ...doc };
    if (data._id) {
        const idStr = data._id.toString();
        data._id = idStr;
        if (!data.id) data.id = idStr;
    }
    delete data.__v;
    return data;
}

function parseMaybeJson(value) {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function saveBase64File(value, prefix = 'img') {
    if (typeof value !== 'string' || !value.startsWith('data:')) {
        return value;
    }
    const matches = value.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
        return value;
    }

    const extension = (matches[1].split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const filename = `${prefix}_${Date.now()}.${extension}`;
    const buffer = Buffer.from(matches[2], 'base64');
    
    [uploadDir1, uploadDir2].forEach(dir => {
        try {
            fs.writeFileSync(path.join(dir, filename), buffer);
        } catch (err) {
            console.error("Gagal menulis file ke " + dir + ":", err);
        }
    });
    
    return filename;
}

function getBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
}

function mediaUrl(req, value) {
    if (!value || typeof value !== 'string') return value;
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/uploads/')) return getBaseUrl(req) + value;
    return `${getBaseUrl(req)}/uploads/${value}`;
}

function enrichLegacyMedia(req, data) {
    if (!data || Array.isArray(data) || typeof data !== 'object') return data;
    const enriched = { ...data };

    if (enriched.bg_image && !enriched.bg_url) enriched.bg_url = mediaUrl(req, enriched.bg_image);
    if (enriched.foto_rektor && !enriched.foto_url) enriched.foto_url = mediaUrl(req, enriched.foto_rektor);
    if (enriched.org_image && !enriched.org_url) enriched.org_url = mediaUrl(req, enriched.org_image);
    if (enriched.image_path && !enriched.image_url) enriched.image_url = mediaUrl(req, enriched.image_path);
    if (enriched.thumbnail && !enriched.thumbnail_url) enriched.thumbnail_url = mediaUrl(req, enriched.thumbnail);
    if (enriched.file_path && !enriched.file_url) enriched.file_url = mediaUrl(req, enriched.file_path);
    if (enriched.image1 && !enriched.image1_url) enriched.image1_url = mediaUrl(req, enriched.image1);
    if (enriched.image2 && !enriched.image2_url) enriched.image2_url = mediaUrl(req, enriched.image2);

    return enriched;
}

function legacySuccess(data, extra = {}) {
    return { status: 'success', success: true, data, ...extra };
}

function idQuery(id) {
    if (!id) return { _id: null };
    const mongoose = require('mongoose');
    const queries = [];
    
    const num = Number(id);
    if (!isNaN(num)) {
        queries.push({ id: num });
    }
    queries.push({ id: String(id) });

    if (mongoose.Types.ObjectId.isValid(String(id))) {
        queries.push({ _id: new mongoose.Types.ObjectId(String(id)) });
        queries.push({ _id: String(id) });
    }

    return queries.length > 1 ? { $or: queries } : queries[0];
}

exports.getAll = async (req, res) => {
    try {
        const moduleName = req.params.module;
        const Model = getModel(moduleName);
        if (!Model) return res.status(404).json({ success: false, status: 'error', error: 'Module not found' });

        if (moduleName === 'cms-contents') {
            const query = req.query.section ? { section_key: req.query.section } : {};
            const rows = await Model.find(query).sort({ id: 1 });
            const formatted = {};
            rows.forEach(row => {
                formatted[row.field_name] = row.field_name === 'image' ? mediaUrl(req, row.content_value) : row.content_value;
            });
            return res.json(legacySuccess(formatted));
        }

        if (moduleName === 'cms-menus') {
            const rows = (await Model.find({}).sort({ urutan: 1 })).map(normalizeDoc);
            const parents = rows.filter(menu => menu.parent_id === null || menu.parent_id === undefined || menu.parent_id === '');
            const menus = parents.map(parent => {
                const subItems = rows
                    .filter(sub => String(sub.parent_id) === String(parent.id))
                    .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0))
                    .map(sub => ({ id: sub.id, label: sub.label, to: sub.route, icon: sub.icon }));

                const item = { id: parent.id, label: parent.label, to: parent.route, icon: parent.icon };
                if (subItems.length) item.subItems = subItems;
                return enrichLegacyMedia(req, item);
            });
            return res.json(legacySuccess(menus));
        }

        if (req.query.id) {
            const doc = await Model.findOne(idQuery(req.query.id));
            const result = normalizeDoc(doc) || {};
            if (moduleName === 'berita') {
                result.title = result.title || result.judul;
                result.date = result.date || result.tanggal;
                if (typeof result.content === 'string') {
                    result.content = parseMaybeJson(result.content);
                    if (typeof result.content === 'string') {
                        result.content = result.content.split('\n');
                    }
                }
            }
            result.categories = parseMaybeJson(result.categories);
            result.documents = parseMaybeJson(result.documents);
            return res.json(legacySuccess(enrichLegacyMedia(req, result)));
        }

        const listModules = ['berita', 'pengumuman', 'admin-konten'];
        if (listModules.includes(moduleName)) {
            const sort = moduleName === 'admin-konten' ? { created_at: -1 } : { tanggal: -1, id: -1 };
            const rows = (await Model.find({}).sort(sort)).map(normalizeDoc).map(item => {
                if (moduleName === 'pengumuman') {
                    const actionUrl = item.tipe === 'link'
                        ? item.url_link
                        : item.file_path
                            ? `/uploads/${item.file_path}`
                            : '#';
                    return enrichLegacyMedia(req, { ...item, action_url: item.action_url || mediaUrl(req, actionUrl) });
                }
                return enrichLegacyMedia(req, item);
            });
            return res.json(legacySuccess(rows, { users: rows }));
        }

        const singleton = normalizeDoc(await Model.findOne({}).sort({ updated_at: -1, createdAt: -1, id: -1 })) || {};
        singleton.categories = parseMaybeJson(singleton.categories);
        singleton.documents = parseMaybeJson(singleton.documents);
        return res.json(legacySuccess(enrichLegacyMedia(req, singleton)));
    } catch (err) {
        res.status(500).json({ success: false, status: 'error', error: err.message, message: err.message });
    }
};

exports.createOrUpdate = async (req, res) => {
    try {
        const moduleName = req.params.module;
        const Model = getModel(moduleName);
        if (!Model) return res.status(404).json({ success: false, status: 'error', error: 'Module not found' });

        let payload = { ...req.body };

        if (req.files && req.files.length > 0) {
            payload.file_path = req.files[0].filename;
            payload.file = req.files[0].filename;
        }

        if (moduleName === 'cms-contents') {
            const section = payload.section_key;
            const field = payload.field_name;
            let value = saveBase64File(payload.content_value, section || 'content');

            if (field === 'image' && !value) {
                const existing = await Model.findOne({ section_key: section, field_name: field });
                value = existing?.content_value || '';
            }

            const updated = await Model.findOneAndUpdate(
                { section_key: section, field_name: field },
                { section_key: section, field_name: field, content_value: value, is_active: 1 },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            return res.json({ status: 'success', success: true, message: 'Berhasil disimpan', data: normalizeDoc(updated) });
        }

        if (moduleName === 'pengumuman') {
            payload.judul = payload.judul || payload.title;
            payload.tanggal = payload.tanggal || payload.date;
            payload.tipe = payload.tipe || payload.type;
            payload.url_link = payload.url_link || payload.link;
            delete payload.title;
            delete payload.date;
            delete payload.type;
            delete payload.link;
        }

        if (moduleName === 'berita') {
            payload.judul = payload.judul || payload.title;
            payload.tanggal = payload.tanggal || payload.date;

            if (Array.isArray(payload.content) || (payload.content && typeof payload.content === 'object')) {
                payload.content = JSON.stringify(payload.content);
            }

            if (payload.delete_image1 || payload.delete_image1 === 'true') payload.image1 = '';
            if (payload.delete_image2 || payload.delete_image2 === 'true') payload.image2 = '';
            delete payload.delete_image1;
            delete payload.delete_image2;

            ['image1', 'image2', 'thumbnail'].forEach(imgField => {
                if (typeof payload[imgField] === 'string' && payload[imgField].includes('/uploads/')) {
                    payload[imgField] = payload[imgField].split('/uploads/').pop();
                }
            });
        }

        if (Array.isArray(payload.content) || (payload.content && typeof payload.content === 'object')) {
            payload.content = JSON.stringify(payload.content);
        }

        ['thumbnail', 'image1', 'image2', 'bg_image', 'bgImage', 'image_path', 'org_image'].forEach(field => {
            if (payload[field]) payload[field] = saveBase64File(payload[field], moduleName.replace(/-/g, '_'));
        });
        if (payload.bgImage && !payload.bg_image) payload.bg_image = payload.bgImage;
        delete payload.bgImage;

        if (payload.categories && typeof payload.categories === 'string') payload.categories = parseMaybeJson(payload.categories);
        if (payload.documents && typeof payload.documents === 'string') payload.documents = parseMaybeJson(payload.documents);

        if (moduleName === 'admin-konten' && payload.password) {
            payload.password = await bcrypt.hash(payload.password, 10);
        }

        const id = req.params.id || payload.id;
        delete payload._id;

        if (id) {
            const updated = await Model.findOneAndUpdate(idQuery(id), payload, { new: true, upsert: true, setDefaultsOnInsert: true });
            return res.json({ status: 'success', success: true, message: 'Berhasil disimpan', data: normalizeDoc(updated) });
        }

        const singletonModules = ['evaluasi', 'peraturan-uud', 'pustaka', 'organisasi', 'sambutan-rektor', 'spmi', 'spme', 'tupoksi', 'visi-misi', 'pelaporan', 'sistem-informasi', 'konsultasi-mutu'];
        if (singletonModules.includes(moduleName)) {
            let filter = payload.section_key ? { section_key: payload.section_key } : null;
            if (!filter) {
                const existing = await Model.findOne({}).sort({ updated_at: -1, createdAt: -1, id: -1 });
                filter = existing ? { _id: existing._id } : { id: 1 };
            }
            const updated = await Model.findOneAndUpdate(filter, { ...payload }, { new: true, upsert: true, setDefaultsOnInsert: true });
            return res.json({ status: 'success', success: true, message: 'Berhasil disimpan', data: normalizeDoc(updated) });
        }

        const last = await Model.findOne({ id: { $exists: true } }).sort({ id: -1 });
        payload.id = Number(last?.id || 0) + 1;
        const created = await Model.create(payload);
        return res.json({ status: 'success', success: true, message: 'Berhasil disimpan', data: normalizeDoc(created) });
    } catch (err) {
        res.status(500).json({ success: false, status: 'error', error: err.message, message: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const moduleName = req.params.module || 'pengumuman';
        const Model = getModel(moduleName);
        if (!Model) return res.status(404).json({ success: false, status: 'error', error: 'Module not found' });

        const targetId = req.params.id || req.query.id || (req.body && req.body.id);
        if (!targetId) return res.status(400).json({ success: false, status: 'error', error: 'ID tidak ditemukan' });

        const deleted = await Model.findOneAndDelete(idQuery(targetId));
        if (!deleted && req.params.id) {
            await Model.deleteMany({ idQuery: idQuery(req.params.id) });
        }
        res.json({ status: 'success', success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, status: 'error', error: err.message, message: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const searchKey = username || email;
        const admin = await Models.AdminKonten.findOne({
            $or: [{ username: searchKey }, { email: searchKey }]
        });
        if (!admin) return res.status(400).json({ success: false, status: 'error', error: 'User not found', message: 'User not found' });

        let validPassword = false;
        if (admin.password && admin.password.startsWith('$2y$')) {
            validPassword = await bcrypt.compare(password, admin.password.replace('$2y$', '$2b$'));
        } else {
            validPassword = await bcrypt.compare(password, admin.password || '');
        }

        if (!validPassword) return res.status(400).json({ success: false, status: 'error', error: 'Invalid password', message: 'Invalid password' });

        res.json({ success: true, status: 'success', user: normalizeDoc(admin) });
    } catch (err) {
        res.status(500).json({ success: false, status: 'error', error: err.message, message: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, nama, email, password, hak_akses } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, status: 'error', message: 'Data register tidak lengkap' });
        }

        const exists = await Models.AdminKonten.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            return res.status(409).json({ success: false, status: 'error', message: 'User sudah terdaftar' });
        }

        const last = await Models.AdminKonten.findOne({ id: { $exists: true } }).sort({ id: -1 });
        const user = await Models.AdminKonten.create({
            id: Number(last?.id || 0) + 1,
            username,
            nama: nama || username,
            email,
            password: await bcrypt.hash(password, 10),
            hak_akses: hak_akses || null
        });

        res.json({ success: true, status: 'success', user: normalizeDoc(user) });
    } catch (err) {
        res.status(500).json({ success: false, status: 'error', message: err.message });
    }
};
