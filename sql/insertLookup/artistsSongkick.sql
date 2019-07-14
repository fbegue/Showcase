select * from [master].[dbo].[artistsSongkick]
--truncate table [master].[dbo].[artistsSongkick]

DECLARE @id int = '3';   
DECLARE @displayName varchar(100) = 'testDisplayName'; 
DECLARE @identifier varchar(150) = 'test-mbei-233r-asfsdf-dfdsasfd'; 
----DECLARE @onTourUntil datetimeoffset(7) = ""

IF NOT EXISTS (SELECT * FROM dbo.artistsSongkick WHERE id = @id)
    INSERT INTO dbo.artistsSongkick(id,displayName,identifier)
	--OUTPUT inserted.id, inserted.name
    VALUES(@id,@displayName,@identifier)
else
	select * from dbo.artistsSongkick WHERE id = @id