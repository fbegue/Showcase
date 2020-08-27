select * from [master].[dbo].artists
--truncate table [master].[dbo].[artists]

DECLARE @id varchar(50) = '052uQIm9OdFVUpsXaIXS7p' 
DECLARE @name varchar(50) = 'testName'; 
DECLARE @uri varchar(100) = 'spotify:track:4aOy3Z4SaX3Mh1rJGh2HLz'; 
----DECLARE @onTourUntil datetimeoffset(7) = ""

IF NOT EXISTS (SELECT * FROM dbo.artists WHERE id = @id)
    INSERT INTO dbo.artists(id,name,uri)
	--OUTPUT inserted.id, inserted.name, inserted.uri
    VALUES(@id,@name,@uri)
else
	select * from dbo.artists WHERE id = @id

select * from dbo.artists a join dbo.artistsSongkick aso on aso.displayName = a.name 

truncate table artist_artistSongkick
declare @artist_id varchar(50) = 'abcdqyz';
declare @artistSongkick_id int = '111111';
insert into artist_artistSongkick(artist_id, artistSongkick_id) values (@artist_id, @artistSongkick_id)

select * from artistsSongkick where displayName = 'Electric Orange Peel'
select * from artists where name = 'Electric Orange Peel'

