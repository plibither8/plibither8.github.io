const {mkdir} = require('fs').promises;
const {createWriteStream} = require('fs');
const path = require('path');

const fetch = require('node-fetch');
const sharp = require('sharp');

const kebab = str => str.replace(/[^\w]/g, '-').toLowerCase();

const main = async data => {
	const FALLBACK_URL = 'https://lastfm.freetls.fastly.net/i/u/64s/2a96cbd8b46e442fc41c2b86b821562f.png';

	const ARTISTS_TEMP = path.join(__dirname, '../assets/img/temp');
	const ARTISTS_FINAL = path.join(__dirname, '../assets/img/artists');
	await mkdir(ARTISTS_TEMP, {recursive: true});
	await mkdir(ARTISTS_FINAL, {recursive: true});

	for (const [index, artist] of data.activityData.lastfm.topFive.entries()) {
		const kebabedName = kebab(artist.name);
		const destTemp = `${ARTISTS_TEMP}/${kebabedName}.jpg`;
		const destFinal = `${ARTISTS_FINAL}/${kebabedName}.jpg`;

		const res = await fetch(artist.image || FALLBACK_URL);

		await new Promise(async (resolve, reject) => {
			const fileStream = await createWriteStream(destTemp);
			res.body.pipe(fileStream);
			res.body.on('error', reject);
			fileStream.on('finish', resolve);
		});

		await sharp(destTemp)
			.resize(100, 100)
			.toFile(destFinal);
	}

	return data;
}

module.exports = main;
