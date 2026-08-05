// server/scripts/migrate-mysql-to-mongo.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const Models = require('../models');

async function migrate() {
    const dbConn = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'spmi_audit'
    });

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spmi_audit');
    console.log('Starting Migration from MySQL to MongoDB...');

    const tables = [
        { name: 'admin_konten', model: Models.AdminKonten },
        { name: 'berita', model: Models.Berita },
        { name: 'cms_contents', model: Models.CmsContent },
        { name: 'cms_menus', model: Models.CmsMenu },
        { name: 'content_konsultasi_mutu', model: Models.ContentKonsultasiMutu },
        { name: 'content_pelaporan', model: Models.ContentPelaporan },
        { name: 'content_sistem_info', model: Models.ContentSistemInfo },
        { name: 'evaluasi', model: Models.Evaluasi, jsonFields: ['categories'] },
        { name: 'layanan_mutu', model: Models.LayananMutu },
        { name: 'organisasi', model: Models.Organisasi },
        { name: 'pengumuman', model: Models.Pengumuman },
        { name: 'peraturan_uud', model: Models.PeraturanUud, jsonFields: ['documents'] },
        { name: 'pustaka', model: Models.Pustaka, jsonFields: ['categories'] },
        { name: 'sambutan_rektor', model: Models.SambutanRektor },
        { name: 'spme', model: Models.Spme },
        { name: 'spmi', model: Models.Spmi, jsonFields: ['documents'] },
        { name: 'tupoksi', model: Models.Tupoksi },
        { name: 'visi_misi', model: Models.VisiMisi }
    ];

    for (const tbl of tables) {
        try {
            const [rows] = await dbConn.execute(`SELECT * FROM ${tbl.name}`);
            if (rows.length > 0) {
                await tbl.model.deleteMany({});

                const formattedRows = rows.map(row => {
                    if (tbl.jsonFields) {
                        tbl.jsonFields.forEach(field => {
                            if (row[field] && typeof row[field] === 'string') {
                                try { row[field] = JSON.parse(row[field]); } catch (e) {}
                            }
                        });
                    }
                    return row;
                });

                await tbl.model.insertMany(formattedRows);
                console.log(`[SUCCESS] Migrated ${rows.length} rows for table: ${tbl.name}`);
            } else {
                console.log(`[SKIPPED] Table ${tbl.name} is empty.`);
            }
        } catch (err) {
            console.error(`[ERROR] Failed migrating table ${tbl.name}:`, err.message);
        }
    }

    await dbConn.end();
    await mongoose.disconnect();
    console.log('Migration Completed Successfully!');
}

migrate().catch(async (err) => {
    console.error('Migration failed:', err.message);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
});
