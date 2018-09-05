var username = "postgres";
var host = "fgi-database";
var database = "fgi_web_gis";
// var host = "localhost";
var password="admin";
// var database = "jeffreydb";
// var password = 'navy23';

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
            table: 'ftth.cells c, ftth.homes_passed hp, ftth.footages f , ftth.pdo pdo, ftth.sheath s',//, ftth.functions_table func',
            columns: `c.cell_id as id, c.pni_cell_name as label, 'CELL' as type, c.netwin_project_name, c.feeder, c.permitting_rolt_number, c.franchise, c.town, hp.total`,
            where: `c.pni_cell_name ilike ? OR c.netwin_cell_jso_name ilike ?`,
            format: function(query) {
                console.log(query)
                return '%' + query.trim() + '%';
            }
        },
    }
};
