import { timestamp } from "rxjs/internal/operators/timestamp";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersSeeder1769929982562 implements MigrationInterface {
    name = 'AddUsersSeeder1769929982562'

    // Hàm tạo user data tự động
    private generateUsers(count: number): string[] {
        const firstNames = ['John', 'Jane', 'Alex', 'Maria', 'David', 'Sarah', 'Michael', 'Emma', 'James', 'Olivia', 
                           'William', 'Sophia', 'Robert', 'Isabella', 'Daniel', 'Mia', 'Matthew', 'Charlotte', 'Joseph', 'Amelia',
                           'Christopher', 'Evelyn', 'Andrew', 'Abigail', 'Ryan', 'Emily', 'Nicholas', 'Elizabeth', 'Joshua', 'Sofia'];
        
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                          'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                          'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
        
        const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 
                          'Japan', 'South Korea', 'Brazil', 'Mexico', 'Argentina', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
                          'Singapore', 'New Zealand', 'Switzerland'];
        
        const genders = ['Male', 'Female'];
        const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE', 'DEACTIVATE']; // 60% ACTIVE
        
        const users: string[] = [];
        const hashedPassword = '$2b$10$rQZ5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5qH5q'; // Password123!
        
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        for (let i = 0; i < count; i++) {
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}.${i}@example.com`;
            const phone = `+1${String(timestamp).substring(3, 10)}${String(i).padStart(3, '0')}`;
            const gender = genders[i % 2];
            const country = countries[i % countries.length];
            const status = statuses[i % statuses.length];
            const referralCode = `${firstName.toUpperCase().substring(0, 3)}${randomString}${i}`;
            const year = 1985 + (i % 16);
            const month = String((i % 12) + 1).padStart(2, '0');
            const day = String(((i % 28) + 1)).padStart(2, '0');
            const birthday = `${year}-${month}-${day}`;
            const referralUserId = (i > 0 && i % 2 === 0) ? Math.floor(Math.random() * i) + 1 : null;
            const emailVerified = status === 'ACTIVE' ? 'NOW()' : 'NULL';
            
            users.push(`
            (
                '${email}',
                '${hashedPassword}',
                '${firstName}',
                '${lastName}',
                '${phone}',
                '${birthday}',
                '${gender}',
                '${country}',
                '${status}',
                '${referralCode}',
                ${referralUserId},
                ${emailVerified},
                NOW(),
                NOW()
            )`);
        }
        
        return users;
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        const numberOfUsers = 5000; 
        
        const userValues = this.generateUsers(numberOfUsers);
        
        await queryRunner.query(`
            INSERT INTO "users" (
                "email", 
                "password", 
                "first_name", 
                "last_name", 
                "phone", 
                "birthday", 
                "gender", 
                "country", 
                "status", 
                "referral_code", 
                "referral_user_id", 
                "email_verified_at",
                "created_at",
                "updated_at"
            ) VALUES ${userValues.join(',')}
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "users" WHERE "email" LIKE '%@example.com'
        `);
    }

}
