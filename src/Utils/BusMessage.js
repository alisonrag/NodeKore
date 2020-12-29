module.exports = class BusMessage {
	constructor() { }

	serialize(id, args) {
		let buf = Buffer.alloc(1024);

		if (typeof args === 'object' && args !== null) {
			// write lenght
			buf.writeInt32BE(0, 0);
			// write type
			buf.writeInt8(0, 4);
			// write Message ID and get the length
			let id_length = buf.write(id, 6);
			// write Message ID lenght
			buf.writeInt8(id_length, 5);
			let offset = 6 + id_length;

			for (var key in args) {
				// write key and get the lenght
				let key_length = buf.write(key, offset + 1);
				// write the key length
				buf.writeInt8(key_length, offset);
				offset = offset + key_length + 1;
				let type = 1;
				let value = args[key];
				if (!isNaN(parseInt((args[key])))) {
					type = 2;
				}
				// write value type
				buf.writeInt8(type, offset);
				offset++;
				let value_length = 4;
				// write value and get the lenght
				if (!isNaN(parseInt((args[key])))) {
					buf.writeInt32BE(args[key], offset + 3);
				} else {
					value_length = buf.write(args[key].toString(), offset + 3);
				}

				// write the value lenght in int24, WTF?!
				buf[offset] = (value_length & 0xff0000) >>> 16;
				buf[offset + 1] = (value_length & 0x00ff00) >>> 8;
				buf[offset + 2] = value_length & 0x0000ff;

				offset = offset + value_length + 3;
			}

			// write lenght
			buf.writeInt32BE(offset, 0);

			// copy the filled bytes to another buffer 
			let buffer = new Buffer.alloc(offset);
			buf.copy(buffer, 0, 0, offset);

			return buffer;
		} else {
			return buf;
		}

	}

	unserialize(data) {
		// parse lenght
		let length = data[0] * 0x1000000 + (data[1] << 16) + (data[2] << 8) + data[3];
		// parse options
		let options = data[4] << 8;
		// parse Message ID lenght
		let MID_len = data[5];
		let MID_start = 6;
		let MID_end = 6 + MID_len;
		// parse Message ID
		let MID_buffer = data.slice(MID_start, MID_end);
		let MID = MID_buffer.toString()
		// copy only the message to another buffer
		let message_buffer = data.slice(MID_end, parseInt(length))
		let message = message_buffer.toString();

		let offset = 0;
		let message_len = message_buffer.length;
		let info = new Object();
		while (offset < message_len) {
			// parse key lenght
			let key_length = message_buffer[offset];
			offset++;
			// parse key
			let key = message_buffer.slice(offset, offset + key_length);
			let key_name = key.toString();
			offset = offset + parseInt(key_length);

			// parse value type
			let type = message_buffer[offset];
			offset++;

			// parse value lenght
			let value = 0;
			let array = Buffer.alloc(4);
			array[1] = message_buffer[offset];
			array[2] = message_buffer[offset + 1];
			array[3] = message_buffer[offset + 2];
			let value_length = array[0] * 0x1000000 + (array[1] << 16) + (array[2] << 8) + array[3];
			offset += 3;

			// parse value
			if (type == 1) {
				let value_data = message_buffer.slice(offset, offset + value_length);
				value = value_data.toString();
			} else if (type == 2) {
				value = message_buffer[offset] * 0x1000000 + (message_buffer[offset + 1] << 16) + (message_buffer[offset + 2] << 8) + message_buffer[offset + 3];
			} else if (type == 0) {
				let value_data = message_buffer.slice(offset, offset + value_length);
				value = value_data.toString();
			}

			offset += value_length;

			info[`${key_name}`] = value;
		}

		// create object
		var obj = { length: length, options: options, MID: MID, MID_len: MID_len, message: message, info: info };

		// return obj in JSON format
		return JSON.stringify(obj);
	}
}