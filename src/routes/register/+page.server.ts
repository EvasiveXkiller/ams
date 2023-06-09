import type { Actions } from './$types';
import { database } from "../../lib/server/database/driver";
import { error, fail, redirect } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'

export const actions = {
	default: async ({cookies, request}) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');
		const displayName = data.get('displayName');

		const ifUserExists = database.prepare('SELECT * FROM users where email = (?)').all(email)

		if (ifUserExists.length > 0) {
			return fail(400, {exists: true})
		}

		const passwordHashed = await bcrypt.hash(password, 10);
		database.prepare('INSERT INTO users (id, displayName ,email, password, userAuthToken) VALUES (@id, @displayName, @email, @password, @authToken)').run({
			id: uuidv4().toString(),
			email,
			displayName,
			password: passwordHashed,
			authToken: crypto.randomUUID()
		})

		throw redirect(303, '/register/success')
	},
} satisfies Actions;
