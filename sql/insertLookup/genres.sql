--truncate table  [master].[dbo].genres
select * from  [master].[dbo].genres

IF NOT EXISTS (SELECT * FROM dbo.genres WHERE name = 'Rock2')
    INSERT INTO dbo.genres(name)
	OUTPUT inserted.id, inserted.name
    VALUES('Rock')
else
	select * from dbo.genres WHERE name = 'Rock1'