const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.set('bufferCommands', false);

async function seedDefaultAdmins() {
    const { AdminKonten } = require('../models');
    const defaults = [
        {
            id: 1,
            username: 'adminkonten',
            email: 'adminkonten@gmail.com',
            password: 'adminkonten',
            nama: 'Admin Konten PJM',
            hak_akses: 'admin_super'
        },
        {
            id: 2,
            username: 'adminkontenpjm',
            email: 'adminkonten@pjm.ac.id',
            password: 'adminkonten123',
            nama: 'Administrator Konten',
            hak_akses: 'admin_super'
        }
    ];

    for (const user of defaults) {
        const exists = await AdminKonten.findOne({ $or: [{ email: user.email }, { username: user.username }] });
        if (!exists) {
            await AdminKonten.create({
                ...user,
                password: await bcrypt.hash(user.password, 10)
            });
            console.log(`Default admin created: ${user.email}`);
        }
    }
}

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spmi_audit';

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
        console.log(`MongoDB Connected Successfully. Database: ${mongoose.connection.name}`);
        await seedDefaultAdmins();
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        console.error('Server tetap berjalan. Pastikan MongoDB aktif dan MONGO_URI benar sebelum memakai endpoint database.');
    }
};

module.exports = connectDB;


