//testable @: https://developer.spotify.com/web-api/console/get-current-user-saved-tracks/#complete

var sample = {
    "href" : "https://api.spotify.com/v1/me/tracks?offset=0&limit=10&market=US",
    "items" : [ {
        "added_at" : "2018-03-08T00:53:53Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/65c0gzsw9JsPUxm09QPjQj"
                    },
                    "href" : "https://api.spotify.com/v1/artists/65c0gzsw9JsPUxm09QPjQj",
                    "id" : "65c0gzsw9JsPUxm09QPjQj",
                    "name" : "ALO",
                    "type" : "artist",
                    "uri" : "spotify:artist:65c0gzsw9JsPUxm09QPjQj"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/0P6RatEaWk3I9BeULb9ZtZ"
                },
                "href" : "https://api.spotify.com/v1/albums/0P6RatEaWk3I9BeULb9ZtZ",
                "id" : "0P6RatEaWk3I9BeULb9ZtZ",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/550f5c7cf0e49d2622cb98076fd1e532711d6d9c",
                    "width" : 640
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/8c11725bcc7d408ef3cccddaf667c5488b81f703",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/034de9b23bdbdd3f2affc54238cbbc1bbc480da3",
                    "width" : 64
                } ],
                "name" : "Tangle Of Time",
                "release_date" : "2015-10-02",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:0P6RatEaWk3I9BeULb9ZtZ"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/65c0gzsw9JsPUxm09QPjQj"
                },
                "href" : "https://api.spotify.com/v1/artists/65c0gzsw9JsPUxm09QPjQj",
                "id" : "65c0gzsw9JsPUxm09QPjQj",
                "name" : "ALO",
                "type" : "artist",
                "uri" : "spotify:artist:65c0gzsw9JsPUxm09QPjQj"
            } ],
            "disc_number" : 1,
            "duration_ms" : 350679,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USUM71509323"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/6MC1qVHAzM2Bzx0jEPxvHU"
            },
            "href" : "https://api.spotify.com/v1/tracks/6MC1qVHAzM2Bzx0jEPxvHU",
            "id" : "6MC1qVHAzM2Bzx0jEPxvHU",
            "is_playable" : true,
            "name" : "The Ticket",
            "popularity" : 41,
            "preview_url" : "https://p.scdn.co/mp3-preview/6f5918ff9ff4813589e05d87a4e218b7b08bab0c?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 4,
            "type" : "track",
            "uri" : "spotify:track:6MC1qVHAzM2Bzx0jEPxvHU"
        }
    }, {
        "added_at" : "2018-03-08T00:48:19Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/0JCxGVxsISZzJHJPUOtceB"
                    },
                    "href" : "https://api.spotify.com/v1/artists/0JCxGVxsISZzJHJPUOtceB",
                    "id" : "0JCxGVxsISZzJHJPUOtceB",
                    "name" : "Tower Of Power",
                    "type" : "artist",
                    "uri" : "spotify:artist:0JCxGVxsISZzJHJPUOtceB"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/6AU6a3Q4NGFnjDBA2BczDk"
                },
                "href" : "https://api.spotify.com/v1/albums/6AU6a3Q4NGFnjDBA2BczDk",
                "id" : "6AU6a3Q4NGFnjDBA2BczDk",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/0a6c0d49a33b72368af5e324e65fdcc03b5c0721",
                    "width" : 640
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/4aa6da391aaec2f97a45cd89fd2df45897082a4f",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/136e6c518ae8cafeaf85b6a2d8edda03d7fc181a",
                    "width" : 64
                } ],
                "name" : "Back To Oakland",
                "release_date" : "1975-06-30",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:6AU6a3Q4NGFnjDBA2BczDk"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/0JCxGVxsISZzJHJPUOtceB"
                },
                "href" : "https://api.spotify.com/v1/artists/0JCxGVxsISZzJHJPUOtceB",
                "id" : "0JCxGVxsISZzJHJPUOtceB",
                "name" : "Tower Of Power",
                "type" : "artist",
                "uri" : "spotify:artist:0JCxGVxsISZzJHJPUOtceB"
            } ],
            "disc_number" : 1,
            "duration_ms" : 459333,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USWB10000634"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/6AzVzSSQ6Wd2ep2SEeqB9V"
            },
            "href" : "https://api.spotify.com/v1/tracks/6AzVzSSQ6Wd2ep2SEeqB9V",
            "id" : "6AzVzSSQ6Wd2ep2SEeqB9V",
            "is_playable" : true,
            "name" : "Squib Cakes",
            "popularity" : 40,
            "preview_url" : "https://p.scdn.co/mp3-preview/419798aca4f006ef1db3f91cc3a2a89616357c12?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 5,
            "type" : "track",
            "uri" : "spotify:track:6AzVzSSQ6Wd2ep2SEeqB9V"
        }
    }, {
        "added_at" : "2018-03-08T00:41:01Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/6Q192DXotxtaysaqNPy5yR"
                    },
                    "href" : "https://api.spotify.com/v1/artists/6Q192DXotxtaysaqNPy5yR",
                    "id" : "6Q192DXotxtaysaqNPy5yR",
                    "name" : "Amy Winehouse",
                    "type" : "artist",
                    "uri" : "spotify:artist:6Q192DXotxtaysaqNPy5yR"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/5WkNPVYW7QyUmNqW5yiodh"
                },
                "href" : "https://api.spotify.com/v1/albums/5WkNPVYW7QyUmNqW5yiodh",
                "id" : "5WkNPVYW7QyUmNqW5yiodh",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/846f97a3e901d9a0710f7f5e127f61debd975a38",
                    "width" : 639
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/53c76c0a114479ede77fc13b0524e9c71a39a669",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/74ed9fbeae5acf7e4ea575b513c338792b2561cf",
                    "width" : 64
                } ],
                "name" : "Frank (US e-Version)",
                "release_date" : "2003",
                "release_date_precision" : "year",
                "type" : "album",
                "uri" : "spotify:album:5WkNPVYW7QyUmNqW5yiodh"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/6Q192DXotxtaysaqNPy5yR"
                },
                "href" : "https://api.spotify.com/v1/artists/6Q192DXotxtaysaqNPy5yR",
                "id" : "6Q192DXotxtaysaqNPy5yR",
                "name" : "Amy Winehouse",
                "type" : "artist",
                "uri" : "spotify:artist:6Q192DXotxtaysaqNPy5yR"
            } ],
            "disc_number" : 1,
            "duration_ms" : 235666,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "GBAAN0300465"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/63hOJX2jdHeRRXQlCKh6gQ"
            },
            "href" : "https://api.spotify.com/v1/tracks/63hOJX2jdHeRRXQlCKh6gQ",
            "id" : "63hOJX2jdHeRRXQlCKh6gQ",
            "is_playable" : true,
            "name" : "Mr Magic (Through The Smoke)",
            "popularity" : 46,
            "preview_url" : "https://p.scdn.co/mp3-preview/0d436b4676f7951180ced4cba1630a91f3739feb?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 18,
            "type" : "track",
            "uri" : "spotify:track:63hOJX2jdHeRRXQlCKh6gQ"
        }
    }, {
        "added_at" : "2018-03-08T00:02:41Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/2ZvrvbQNrHKwjT7qfGFFUW"
                    },
                    "href" : "https://api.spotify.com/v1/artists/2ZvrvbQNrHKwjT7qfGFFUW",
                    "id" : "2ZvrvbQNrHKwjT7qfGFFUW",
                    "name" : "Herbie Hancock",
                    "type" : "artist",
                    "uri" : "spotify:artist:2ZvrvbQNrHKwjT7qfGFFUW"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/1IDF7HrugntNS4NeuzYWgQ"
                },
                "href" : "https://api.spotify.com/v1/albums/1IDF7HrugntNS4NeuzYWgQ",
                "id" : "1IDF7HrugntNS4NeuzYWgQ",
                "images" : [ {
                    "height" : 638,
                    "url" : "https://i.scdn.co/image/660db01ccc21aca3a2eed3ef7ef0ad756d301966",
                    "width" : 640
                }, {
                    "height" : 299,
                    "url" : "https://i.scdn.co/image/43dc074b49798d98a2db32b786d7f715a33e1c3b",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/be1d47e2fc140c1a4dbb9314605cf91901249a76",
                    "width" : 64
                } ],
                "name" : "Cantaloupe Island",
                "release_date" : "1994-06-18",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:1IDF7HrugntNS4NeuzYWgQ"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/2ZvrvbQNrHKwjT7qfGFFUW"
                },
                "href" : "https://api.spotify.com/v1/artists/2ZvrvbQNrHKwjT7qfGFFUW",
                "id" : "2ZvrvbQNrHKwjT7qfGFFUW",
                "name" : "Herbie Hancock",
                "type" : "artist",
                "uri" : "spotify:artist:2ZvrvbQNrHKwjT7qfGFFUW"
            } ],
            "disc_number" : 1,
            "duration_ms" : 431906,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USBN28700098"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/5rmcFRG9Lp6KK92CMQWxfD"
            },
            "href" : "https://api.spotify.com/v1/tracks/5rmcFRG9Lp6KK92CMQWxfD",
            "id" : "5rmcFRG9Lp6KK92CMQWxfD",
            "is_playable" : true,
            "name" : "Watermelon Man",
            "popularity" : 44,
            "preview_url" : "https://p.scdn.co/mp3-preview/2d75847fed92b9e731102b7d148cdd01c8abba96?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 2,
            "type" : "track",
            "uri" : "spotify:track:5rmcFRG9Lp6KK92CMQWxfD"
        }
    }, {
        "added_at" : "2018-03-07T23:52:30Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/1fZXjUQEkVbB0TvZX4qFR8"
                    },
                    "href" : "https://api.spotify.com/v1/artists/1fZXjUQEkVbB0TvZX4qFR8",
                    "id" : "1fZXjUQEkVbB0TvZX4qFR8",
                    "name" : "Lettuce",
                    "type" : "artist",
                    "uri" : "spotify:artist:1fZXjUQEkVbB0TvZX4qFR8"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/1zlM7SmfDYmOWbOLk6d34Y"
                },
                "href" : "https://api.spotify.com/v1/albums/1zlM7SmfDYmOWbOLk6d34Y",
                "id" : "1zlM7SmfDYmOWbOLk6d34Y",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/64b94532c59ed03ebfce63b706d65a06933e2c87",
                    "width" : 640
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/edd4741c0c67641490411c529c2fc4030abd585d",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/ba573df2e006e27df318c10347721cdc70c5d96c",
                    "width" : 64
                } ],
                "name" : "Rage",
                "release_date" : "2008",
                "release_date_precision" : "year",
                "type" : "album",
                "uri" : "spotify:album:1zlM7SmfDYmOWbOLk6d34Y"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/1fZXjUQEkVbB0TvZX4qFR8"
                },
                "href" : "https://api.spotify.com/v1/artists/1fZXjUQEkVbB0TvZX4qFR8",
                "id" : "1fZXjUQEkVbB0TvZX4qFR8",
                "name" : "Lettuce",
                "type" : "artist",
                "uri" : "spotify:artist:1fZXjUQEkVbB0TvZX4qFR8"
            } ],
            "disc_number" : 1,
            "duration_ms" : 223400,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USRV40800601"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/2iRC5jMXSn0Bf4sss7nIHZ"
            },
            "href" : "https://api.spotify.com/v1/tracks/2iRC5jMXSn0Bf4sss7nIHZ",
            "id" : "2iRC5jMXSn0Bf4sss7nIHZ",
            "is_playable" : true,
            "name" : "Blast Off",
            "popularity" : 34,
            "preview_url" : "https://p.scdn.co/mp3-preview/381a9894c22f851e4320af1a71c2ef4f82994741?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 1,
            "type" : "track",
            "uri" : "spotify:track:2iRC5jMXSn0Bf4sss7nIHZ"
        }
    }, {
        "added_at" : "2018-03-07T17:14:34Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/7jefIIksOi1EazgRTfW2Pk"
                    },
                    "href" : "https://api.spotify.com/v1/artists/7jefIIksOi1EazgRTfW2Pk",
                    "id" : "7jefIIksOi1EazgRTfW2Pk",
                    "name" : "Electric Light Orchestra",
                    "type" : "artist",
                    "uri" : "spotify:artist:7jefIIksOi1EazgRTfW2Pk"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/7AjmuoxXSTZUEuFZ8Wrsny"
                },
                "href" : "https://api.spotify.com/v1/albums/7AjmuoxXSTZUEuFZ8Wrsny",
                "id" : "7AjmuoxXSTZUEuFZ8Wrsny",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/f56d644169fceacbf795e2f85a74ec57059ec8a3",
                    "width" : 640
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/4ffe8fbf593ebd4289cb807456cad96f609b5fa9",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/f44bbe93378e015bfb7f2852a364e7782dfa309f",
                    "width" : 64
                } ],
                "name" : "Electric Light Orchestra II",
                "release_date" : "1973",
                "release_date_precision" : "year",
                "type" : "album",
                "uri" : "spotify:album:7AjmuoxXSTZUEuFZ8Wrsny"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/7jefIIksOi1EazgRTfW2Pk"
                },
                "href" : "https://api.spotify.com/v1/artists/7jefIIksOi1EazgRTfW2Pk",
                "id" : "7jefIIksOi1EazgRTfW2Pk",
                "name" : "Electric Light Orchestra",
                "type" : "artist",
                "uri" : "spotify:artist:7jefIIksOi1EazgRTfW2Pk"
            } ],
            "disc_number" : 1,
            "duration_ms" : 489106,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USSM10024487"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/0eHUMhIkmOQJAkJhiHVD08"
            },
            "href" : "https://api.spotify.com/v1/tracks/0eHUMhIkmOQJAkJhiHVD08",
            "id" : "0eHUMhIkmOQJAkJhiHVD08",
            "is_playable" : true,
            "name" : "Roll Over Beethoven",
            "popularity" : 29,
            "preview_url" : "https://p.scdn.co/mp3-preview/7a5e0e2852363c646079e556518cec04911f4155?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 3,
            "type" : "track",
            "uri" : "spotify:track:0eHUMhIkmOQJAkJhiHVD08"
        }
    }, {
        "added_at" : "2018-03-06T22:37:39Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/3Mcii5XWf6E0lrY3Uky4cA"
                    },
                    "href" : "https://api.spotify.com/v1/artists/3Mcii5XWf6E0lrY3Uky4cA",
                    "id" : "3Mcii5XWf6E0lrY3Uky4cA",
                    "name" : "Ice Cube",
                    "type" : "artist",
                    "uri" : "spotify:artist:3Mcii5XWf6E0lrY3Uky4cA"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/7JlCbNWZszAdVKZdtHFQ5p"
                },
                "href" : "https://api.spotify.com/v1/albums/7JlCbNWZszAdVKZdtHFQ5p",
                "id" : "7JlCbNWZszAdVKZdtHFQ5p",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/5614d26bff56d8d0224a1464e4f6583ca2bccabb",
                    "width" : 640
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/08ff5f4241a90ed0432a53cc5d79775648a9418c",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/1aa9b9b92693b3206b8a14572af2cb8c1cab97cd",
                    "width" : 64
                } ],
                "name" : "Lethal Injection",
                "release_date" : "1993-12-07",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:7JlCbNWZszAdVKZdtHFQ5p"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/3Mcii5XWf6E0lrY3Uky4cA"
                },
                "href" : "https://api.spotify.com/v1/artists/3Mcii5XWf6E0lrY3Uky4cA",
                "id" : "3Mcii5XWf6E0lrY3Uky4cA",
                "name" : "Ice Cube",
                "type" : "artist",
                "uri" : "spotify:artist:3Mcii5XWf6E0lrY3Uky4cA"
            } ],
            "disc_number" : 1,
            "duration_ms" : 279826,
            "explicit" : true,
            "external_ids" : {
                "isrc" : "USPO10300108"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/20LM2DYl5ssReQIaterJGX"
            },
            "href" : "https://api.spotify.com/v1/tracks/20LM2DYl5ssReQIaterJGX",
            "id" : "20LM2DYl5ssReQIaterJGX",
            "is_playable" : true,
            "name" : "Down For Whatever",
            "popularity" : 42,
            "preview_url" : "https://p.scdn.co/mp3-preview/9f7b5366ffc9d5ea6d96bc98c01ecc03c8b5b082?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 10,
            "type" : "track",
            "uri" : "spotify:track:20LM2DYl5ssReQIaterJGX"
        }
    }, {
        "added_at" : "2018-03-06T22:34:25Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/3ipn9JLAPI5GUEo4y4jcoi"
                    },
                    "href" : "https://api.spotify.com/v1/artists/3ipn9JLAPI5GUEo4y4jcoi",
                    "id" : "3ipn9JLAPI5GUEo4y4jcoi",
                    "name" : "Ludacris",
                    "type" : "artist",
                    "uri" : "spotify:artist:3ipn9JLAPI5GUEo4y4jcoi"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/3hJHXxX04PNuGFIxdEHGzg"
                },
                "href" : "https://api.spotify.com/v1/albums/3hJHXxX04PNuGFIxdEHGzg",
                "id" : "3hJHXxX04PNuGFIxdEHGzg",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/49c313dbab13c79ddc8ab4a1bae9f69ac0255f39",
                    "width" : 618
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/51b6447a68c0a42ee1a78182fb293f5a84ee35b6",
                    "width" : 290
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/8439298d3c0234f6b82cf10ba7b8a4c96f6781ea",
                    "width" : 62
                } ],
                "name" : "Chicken - N - Beer",
                "release_date" : "2003-01-01",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:3hJHXxX04PNuGFIxdEHGzg"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/3ipn9JLAPI5GUEo4y4jcoi"
                },
                "href" : "https://api.spotify.com/v1/artists/3ipn9JLAPI5GUEo4y4jcoi",
                "id" : "3ipn9JLAPI5GUEo4y4jcoi",
                "name" : "Ludacris",
                "type" : "artist",
                "uri" : "spotify:artist:3ipn9JLAPI5GUEo4y4jcoi"
            } ],
            "disc_number" : 1,
            "duration_ms" : 252840,
            "explicit" : true,
            "external_ids" : {
                "isrc" : "USDJ20300802"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/1AcKboMkn1HekyJSlKKEc3"
            },
            "href" : "https://api.spotify.com/v1/tracks/1AcKboMkn1HekyJSlKKEc3",
            "id" : "1AcKboMkn1HekyJSlKKEc3",
            "is_playable" : true,
            "name" : "Diamond In The Back",
            "popularity" : 43,
            "preview_url" : "https://p.scdn.co/mp3-preview/e3b02e7f460a8c345010601994a12dc0f2b351df?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 7,
            "type" : "track",
            "uri" : "spotify:track:1AcKboMkn1HekyJSlKKEc3"
        }
    }, {
        "added_at" : "2018-03-06T22:30:33Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/37ZvFp654tY74Z1D2TLOGR"
                    },
                    "href" : "https://api.spotify.com/v1/artists/37ZvFp654tY74Z1D2TLOGR",
                    "id" : "37ZvFp654tY74Z1D2TLOGR",
                    "name" : "Trombone Shorty",
                    "type" : "artist",
                    "uri" : "spotify:artist:37ZvFp654tY74Z1D2TLOGR"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/5J26uchSALEhy9xwkdeV5a"
                },
                "href" : "https://api.spotify.com/v1/albums/5J26uchSALEhy9xwkdeV5a",
                "id" : "5J26uchSALEhy9xwkdeV5a",
                "images" : [ {
                    "height" : 640,
                    "url" : "https://i.scdn.co/image/ae1c7879fb45d88c79f2c63622507a573cd865cf",
                    "width" : 640
                }, {
                    "height" : 300,
                    "url" : "https://i.scdn.co/image/b7df71eb570614f6d15d7169a65b9c9e2929ff8e",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/c00f0de612e191a132701ab0e11b8538e362c8df",
                    "width" : 64
                } ],
                "name" : "Backatown",
                "release_date" : "2010-01-01",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:5J26uchSALEhy9xwkdeV5a"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/37ZvFp654tY74Z1D2TLOGR"
                },
                "href" : "https://api.spotify.com/v1/artists/37ZvFp654tY74Z1D2TLOGR",
                "id" : "37ZvFp654tY74Z1D2TLOGR",
                "name" : "Trombone Shorty",
                "type" : "artist",
                "uri" : "spotify:artist:37ZvFp654tY74Z1D2TLOGR"
            } ],
            "disc_number" : 1,
            "duration_ms" : 200000,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USUM71005364"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/10yqXWUbVgZy0XzonDOIgs"
            },
            "href" : "https://api.spotify.com/v1/tracks/10yqXWUbVgZy0XzonDOIgs",
            "id" : "10yqXWUbVgZy0XzonDOIgs",
            "is_playable" : true,
            "name" : "Hurricane Season",
            "popularity" : 45,
            "preview_url" : "https://p.scdn.co/mp3-preview/16ed9b3fd8658fb4f88620a21c33ac5949726701?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 1,
            "type" : "track",
            "uri" : "spotify:track:10yqXWUbVgZy0XzonDOIgs"
        }
    }, {
        "added_at" : "2018-03-06T22:21:36Z",
        "track" : {
            "album" : {
                "album_type" : "album",
                "artists" : [ {
                    "external_urls" : {
                        "spotify" : "https://open.spotify.com/artist/0kbYTNQb4Pb1rPbbaF0pT4"
                    },
                    "href" : "https://api.spotify.com/v1/artists/0kbYTNQb4Pb1rPbbaF0pT4",
                    "id" : "0kbYTNQb4Pb1rPbbaF0pT4",
                    "name" : "Miles Davis",
                    "type" : "artist",
                    "uri" : "spotify:artist:0kbYTNQb4Pb1rPbbaF0pT4"
                } ],
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/album/28IDISyL4r5E5PXP0aQMnl"
                },
                "href" : "https://api.spotify.com/v1/albums/28IDISyL4r5E5PXP0aQMnl",
                "id" : "28IDISyL4r5E5PXP0aQMnl",
                "images" : [ {
                    "height" : 637,
                    "url" : "https://i.scdn.co/image/5464792deeb1f1cdf846e61d5bc12cb4962c3285",
                    "width" : 640
                }, {
                    "height" : 299,
                    "url" : "https://i.scdn.co/image/403363c84c203300a2d4e3ec87b17d2e85f26353",
                    "width" : 300
                }, {
                    "height" : 64,
                    "url" : "https://i.scdn.co/image/65744f0041e9b4c4f47bb4a3e8a7d9f440ab6382",
                    "width" : 64
                } ],
                "name" : "Doo-Bop",
                "release_date" : "1992-06-26",
                "release_date_precision" : "day",
                "type" : "album",
                "uri" : "spotify:album:28IDISyL4r5E5PXP0aQMnl"
            },
            "artists" : [ {
                "external_urls" : {
                    "spotify" : "https://open.spotify.com/artist/0kbYTNQb4Pb1rPbbaF0pT4"
                },
                "href" : "https://api.spotify.com/v1/artists/0kbYTNQb4Pb1rPbbaF0pT4",
                "id" : "0kbYTNQb4Pb1rPbbaF0pT4",
                "name" : "Miles Davis",
                "type" : "artist",
                "uri" : "spotify:artist:0kbYTNQb4Pb1rPbbaF0pT4"
            } ],
            "disc_number" : 1,
            "duration_ms" : 297440,
            "explicit" : false,
            "external_ids" : {
                "isrc" : "USWB10101936"
            },
            "external_urls" : {
                "spotify" : "https://open.spotify.com/track/6lbzLUoma85KVbQqBpvBrw"
            },
            "href" : "https://api.spotify.com/v1/tracks/6lbzLUoma85KVbQqBpvBrw",
            "id" : "6lbzLUoma85KVbQqBpvBrw",
            "is_playable" : true,
            "name" : "The Doo-Bop Song",
            "popularity" : 43,
            "preview_url" : "https://p.scdn.co/mp3-preview/4894e509ca34ce0bc76842881ad0b78b7206dff5?cid=8897482848704f2a8f8d7c79726a70d4",
            "track_number" : 2,
            "type" : "track",
            "uri" : "spotify:track:6lbzLUoma85KVbQqBpvBrw"
        }
    } ],
    "limit" : 10,
    "next" : "https://api.spotify.com/v1/me/tracks?offset=10&limit=10&market=US",
    "offset" : 0,
    "previous" : null,
    "total" : 869
}