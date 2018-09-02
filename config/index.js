var username = "postgres";
// var host = "fgi-database";
// var database = "fgi_web_gis";
var host = "localhost";
var database = "jeffreydb";
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
        cell: {
            table: 'parks p, tax_parcels t',
            columns: `p.gid as id, prkname as label, 'PARK' as type, round(ST_X(ST_Transform(p.the_geom, 4326))::NUMERIC,4) as lng, round(ST_Y(ST_Transform(p.the_geom, 4326))::NUMERIC,4) as lat, t.pid as pid, prkaddr as address`,
            where: 'prkname ilike ? and p.the_geom && t.the_geom',
            format: function(query) {
                return '%' + query.trim() + '%';
            }
        },
    }
};
