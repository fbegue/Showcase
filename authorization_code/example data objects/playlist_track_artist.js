//based on a quick test here, it doesn't appear as though I can pare down the artist object at all (unlike every other field)
//and therefore certainly can't ask for MORE information than I already have

//url="https://developer.spotify.com/console/get-playlist-tracks/"
//fields="items(track(album(album_type,artists(name))))"

module.exports.track_artist = {
	"items": [
		{
			"track": {
				"album": {
					"album_type": "single",
					"artists": [
						{
							"external_urls": {
								"spotify": "https://open.spotify.com/artist/3nAdmhth5AczU6YwCJOlYh"
							},
							"href": "https://api.spotify.com/v1/artists/3nAdmhth5AczU6YwCJOlYh",
							"id": "3nAdmhth5AczU6YwCJOlYh",
							"name": "Dropgun",
							"type": "artist",
							"uri": "spotify:artist:3nAdmhth5AczU6YwCJOlYh"
						}
					]
				}
			}
		}
]}