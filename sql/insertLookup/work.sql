-- reset db script start

select * from [master].[dbo].[artistsSongkick]
truncate table [master].[dbo].[artistsSongkick]

select * from [master].[dbo].[artist_artistSongkick]
truncate table  [master].[dbo].[artist_artistSongkick]
select * from [master].[dbo].[artists]
truncate table [master].[dbo].[artists]

select * from [master].[dbo].genre_artist
truncate table [master].[dbo].genre_artist

delete from genre_family where genre_family.source != 'SpotifyDefault'

-- reset db script end

select * from [master].[dbo].genres
truncate table  [master].[dbo].genres
select * from genre_family
truncate table genre_family;
select * from families
truncate table families

--remove all but SpotifyDefault
select * from genre_family where genre_family.source != 'SpotifyDefault'
delete from genre_family where genre_family.source != 'SpotifyDefault'

--check if 
select g.id,f.id,g.name as gname, f.name as fname, gf.source 
 from genre_family gf join genres g on gf.genre_id=g.id join families f on f.id = gf.family_id
 where source != 'SpotifyDefault'
--where g.name = 'electronic trap'
--where g.name = 'indie rock'
select [dbo].[Levenshtein]('spot','spooasdfsdft',10000);


--found genres - spotify
select distinct a.id, a.name, g.id as genre_id,g.name as genre 
from artists a
left join genre_artist ga on a.id = ga.artist_id
left join genres g on ga.genre_id = g.id
where g.name is not null
and a.id = '0g9vAlRPK9Gt3FKCekk4TW'
group by a.id,a.name,g.id,g.name 
having count(*) >=1

select * from artists a where a.id = '0g9vAlRPK9Gt3FKCekk4TW'

--found genres - songkick
select distinct a.id, a.displayName, g.id as genre_id,g.name as genre
from artistsSongkick a
left join genre_artist ga on a.id = ga.artistSongkick_id
left join genres g on ga.genre_id = g.id
where g.name is not null
group by a.id,a.displayName,g.id,g.name
having count(*) >=1

--found genres - songkick artists link to spotify
select distinct a.id, a.name, ask.id as artistSongkick_id, ask.displayName, g.id as genre_id,g.name as genre, f.id as family_id,f.name as family_name
from artistsSongkick ask
left join artist_artistSongkick aask on aask.artistSongkick_id = ask.id 
left join artists a on a.id = aask.artist_id
--get genres from spotify
left join genre_artist ga on  aask.artist_id = ga.artist_id
left join genres g on ga.genre_id = g.id
left join genre_family gf on g.id = gf.genre_id
left join families f on gf.family_id = f.id
where g.name is not null
group by  a.id, a.name, ask.id,ask.displayName,g.id,g.name,f.name,f.id
having count(*) >=1


--=============================================
--haven't looked at since rewrite
-- vvvvvvv

--working pass/fail check for getBandPage

DECLARE @artistId varchar(50) = '7716964'; 

select * from artistsSongkick aso 
left join genre_artist ga on aso.id = ga.artist_id
left join genres g on ga.genre_id = g.id
left join artists a on a.id = ga.artist_id
where  aso.id = cast(@artistId  as int) or a.id = @artistId

--couldn't find genres
select aso.id,aso.displayName,g.name,aso.lastLook from artistsSongkick aso 
left join genre_artist ga on aso.id = ga.artist_id
left join genres g on ga.genre_id = g.id
left join artists a on a.id = ga.artist_id
where g.name is null
group by aso.id,aso.displayName,g.name,aso.lastLook 
having count(*) = 1
order by aso.lastLook



--found genres - songkick
select distinct aso.id,aso.displayName,g.name from artistsSongkick aso 
left join genre_artist ga on aso.id = ga.artist_id
left join genres g on ga.genre_id = g.id
left join artists a on a.id = ga.artist_id
where g.name is not null
group by aso.id,aso.displayName,g.name 
having count(*) >=1

select aso.id,aso.displayName,g.name,aso.lastLook
from artistsSongkick aso 
 join genre_artist ga on aso.id = ga.artistSongkick_id
left join genres g on ga.genre_id = g.id
--where g.name is not null
--and aso.id = '180283'
group by aso.id,aso.displayName,g.name,aso.lastLook 
--having count(*) = 1
having count(*) >=1
order by aso.lastLook DESC

--get all distinct spotify artists and their genres and related artistSongkick_id if available
select distinct a.id,aas.artistSongkick_id,a.name,g.name,g.id,a.lastLook
from artists a 
left join artist_artistSongkick aas on aas.artist_id = a.id
join genre_artist ga on a.id = ga.artist_id
left join genres g on ga.genre_id = g.id
where g.name is not null 
--and a.name = 'Squirrel Flower'
group by a.id,a.name,g.name,a.lastLook,aas.artistSongkick_id,g.name, g.id
--having count(*) = 1
having count(*) >=1
order by a.lastLook DESC
