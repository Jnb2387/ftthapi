var username = "postgres";
var host = "fgi-database";
var database = "fgi_web_gis";
var password = 'navy23';

module.exports = {
    schemes: ['http'],
    host: 'localhost:8011'||'0.0.0.0',
    port: process.env.PORT || 8011,
    db: {
        postgis: "postgres://" + username + ":" + password + "@" + host + "/" + database
    },
    cache: {
        expiresIn: 30 * 1000,
        privacy: 'private'
    },
    search: {
        address: {
            table: 'master_address_table',
            columns: `objectid as id, full_address as label, 'ADDRESS' as type, round(ST_X(ST_Transform(the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(the_geom, 4326))::NUMERIC,4) as lat, num_parent_parcel as pid, full_address as address`,
            where: `ts @@ to_tsquery('addressing_en', ?) and cde_status='A' and num_x_coord > 0`,
            format: function(query) {
                return query.trim().toUpperCase().replace(/ /g, '&') + ':*';
            }
        },
        park: {
            table: 'parks p, tax_parcels t',
            columns: `p.gid as id, prkname as label, 'PARK' as type, round(ST_X(ST_Transform(p.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(p.the_geom, 4326))::NUMERIC,4) as lat, t.pid as pid, prkaddr as address`,
            where: 'prkname ilike ? and p.the_geom && t.the_geom',
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        },
        pid: {
            table: 'master_address_table',
            columns: `objectid as id, num_parent_parcel as label, 'TAX PARCEL' as type, round(ST_X(ST_Transform(the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(the_geom, 4326))::NUMERIC,4) as lat, num_parent_parcel as pid, full_address as address`,
            where: `num_parent_parcel = ? and num_x_coord > 0 and cde_status='A'`,
            format: function(query) {
                return query.trim();
            }
        },
        library: {
            table: 'libraries l, tax_parcels p',
            columns: `l.gid as id, name as label, 'LIBRARY' as type, round(ST_X(ST_Transform(l.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(l.the_geom, 4326))::NUMERIC,4) as lat, p.pid as pid, address`,
            where: `name ilike ? and l.the_geom && p.the_geom`,
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        },
        school: {
            table: 'schools s, tax_parcels p',
            columns: `s.gid as id, schlname as label, 'SCHOOL' as type, round(ST_X(ST_Transform(s.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(s.the_geom, 4326))::NUMERIC,4) as lat, p.pid as pid, address`,
            where: `schlname ilike ? and s.the_geom && p.the_geom`,
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        },
        business: {
            table: 'businesswise_businesses b, tax_parcels p',
            columns: `b.gid as id, company as label, 'BUSINESS' as type, round(ST_X(ST_Transform(b.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(b.the_geom, 4326))::NUMERIC,4) as lat, p.pid as pid, address`,
            where: `company ilike ? and b.the_geom && p.the_geom`,
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        }
    }
};
