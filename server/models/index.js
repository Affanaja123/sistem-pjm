// server/models/index.js
const mongoose = require('mongoose');

const AdminKontenSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    nama: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    hak_akses: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'admin_konten' });

const BeritaSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.Mixed,
    judul: String,
    tanggal: String,
    ringkasan: String,
    thumbnail: String,
    content: mongoose.Schema.Types.Mixed,
    image1: String,
    image2: String
}, { collection: 'berita' });

const CmsContentSchema = new mongoose.Schema({
    id: { type: Number, unique: true, sparse: true },
    section_key: String,
    field_name: String,
    content_value: String,
    is_active: Number
}, { timestamps: { updatedAt: 'updated_at' }, collection: 'cms_contents' });

const CmsMenuSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    label: String,
    route: String,
    parent_id: mongoose.Schema.Types.Mixed,
    urutan: Number,
    icon: String,
    is_system: Number
}, { collection: 'cms_menus' });

const makeGenericSchema = (collection) => new mongoose.Schema({}, {
    strict: false,
    timestamps: { updatedAt: 'updated_at' },
    collection
});

module.exports = {
    AdminKonten: mongoose.model('AdminKonten', AdminKontenSchema),
    Berita: mongoose.model('Berita', makeGenericSchema('berita')),
    CmsContent: mongoose.model('CmsContent', CmsContentSchema),
    CmsMenu: mongoose.model('CmsMenu', CmsMenuSchema),
    ContentKonsultasiMutu: mongoose.model('ContentKonsultasiMutu', makeGenericSchema('content_konsultasi_mutu')),
    ContentPelaporan: mongoose.model('ContentPelaporan', makeGenericSchema('content_pelaporan')),
    ContentSistemInfo: mongoose.model('ContentSistemInfo', makeGenericSchema('content_sistem_info')),
    Evaluasi: mongoose.model('Evaluasi', makeGenericSchema('evaluasi')),
    LayananMutu: mongoose.model('LayananMutu', makeGenericSchema('layanan_mutu')),
    Organisasi: mongoose.model('Organisasi', makeGenericSchema('organisasi')),
    Pengumuman: mongoose.model('Pengumuman', makeGenericSchema('pengumuman')),
    PeraturanUud: mongoose.model('PeraturanUud', makeGenericSchema('peraturan_uud')),
    Pustaka: mongoose.model('Pustaka', makeGenericSchema('pustaka')),
    SambutanRektor: mongoose.model('SambutanRektor', makeGenericSchema('sambutan_rektor')),
    Spme: mongoose.model('Spme', makeGenericSchema('spme')),
    Spmi: mongoose.model('Spmi', makeGenericSchema('spmi')),
    Tupoksi: mongoose.model('Tupoksi', makeGenericSchema('tupoksi')),
    VisiMisi: mongoose.model('VisiMisi', makeGenericSchema('visi_misi'))
};
