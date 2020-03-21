select * from [master].[dbo].[artistsSongkick]
--delete from [artistsSongkick] where displayName is null
--truncate table [master].[dbo].[artistsSongkick]

DECLARE @id int = '3';   
DECLARE @displayName varchar(100) = 'testDisplayName'; 
DECLARE @identifier varchar(150) = 'test-mbei-233r-asfsdf-dfdsasfd'; 
DECLARE @lastLook datetimeoffset(7) = '2019-10-19T19:33:15.538Z'; 
----DECLARE @onTourUntil datetimeoffset(7) = ""

IF NOT EXISTS (SELECT * FROM dbo.artistsSongkick WHERE id = @id)
    INSERT INTO dbo.artistsSongkick(id,displayName,identifier,lastLook)
	--OUTPUT inserted.id, inserted.name
    VALUES(@id,@displayName,@identifier,@lastLook)
else
	select * from dbo.artistsSongkick WHERE id = @id

insert into [master].[dbo].[artistsSongkick] (id,displayName) values (74358471,'Death Valley Girls')