select * from [master].[dbo].genre_artist
--where artistSongkick_id is not null
--truncate table [master].[dbo].genre_artist

DECLARE @genre_id int = '1';   
--songkick (string int)
DECLARE @artist_id varchar(50) = '253846'; 
--spotify (string)
--DECLARE @artist_id varchar(50) = '1CD77o9fbdyQFrHnUPUEsF'; 

IF NOT EXISTS (SELECT * FROM dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id)
    INSERT INTO dbo.genre_artist(genre_id,artist_id)
	OUTPUT inserted.genre_id, inserted.artist_id
    VALUES(@genre_id,@artist_id)
else
	select * from dbo.genre_artist WHERE genre_id = @genre_id and artist_id = @artist_id

 



