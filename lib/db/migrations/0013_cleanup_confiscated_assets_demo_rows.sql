-- Removes only unchanged fictional rows created by the former development
-- seed. Matching the complete original signature preserves any row that was
-- subsequently curated and leaves it for explicit editorial review.
DELETE FROM "confiscated_assets" AS asset
USING (
  VALUES
    (
      'appartamento-via-del-progresso-nicastro',
      'Appartamento in Via del Progresso',
      'Unità immobiliare residenziale confiscata e trasferita al patrimonio del Comune, in attesa di destinazione a finalità sociali.',
      'Appartamento',
      'confiscato',
      'Via del Progresso, Nicastro, Lamezia Terme',
      '',
      '',
      'Foglio 12, particella 340, sub 4',
      'https://www.benisequestraticonfiscati.it/',
      38.9785000,
      16.3095000,
      'Via del Progresso, Nicastro',
      'nicastro'
    ),
    (
      'terreno-agricolo-sambiase',
      'Terreno agricolo in località Sambiase',
      'Terreno agricolo confiscato e assegnato a una cooperativa sociale per la coltivazione e l''inserimento lavorativo di soggetti svantaggiati.',
      'Terreno',
      'assegnato',
      'Contrada Magolà, Sambiase, Lamezia Terme',
      'Cooperativa sociale Terra Libera',
      'Agricoltura sociale e inserimento lavorativo',
      'Foglio 28, particelle 12-15',
      'https://www.benisequestraticonfiscati.it/',
      38.9620000,
      16.2980000,
      'Contrada Magolà, Sambiase',
      'sambiase'
    ),
    (
      'capannone-zona-industriale',
      'Capannone in zona industriale',
      'Capannone artigianale sottoposto a sequestro nell''ambito di un procedimento di prevenzione patrimoniale.',
      'Capannone',
      'sequestrato',
      'Zona Industriale, Sant''Eufemia, Lamezia Terme',
      '',
      '',
      'Foglio 5, particella 88',
      'https://www.benisequestraticonfiscati.it/',
      38.9180000,
      16.2620000,
      'Zona Industriale, Sant''Eufemia',
      'santeufemia'
    ),
    (
      'villa-confiscata-riuso-sociale-nicastro',
      'Villa riutilizzata come centro polifunzionale',
      'Villa confiscata alla criminalità organizzata e riutilizzata come centro polifunzionale per attività educative e di aggregazione giovanile.',
      'Villa',
      'riutilizzato',
      'Via Marconi, Nicastro, Lamezia Terme',
      'Associazione Libera – Presidio di Lamezia Terme',
      'Centro polifunzionale e doposcuola',
      'Foglio 14, particella 210',
      'https://www.libera.it/',
      38.9760000,
      16.3150000,
      'Via Marconi, Nicastro',
      'nicastro'
    ),
    (
      'locale-commerciale-corso-numistrano',
      'Locale commerciale su Corso Numistrano',
      'Locale commerciale confiscato in attesa di assegnazione a un soggetto del terzo settore.',
      'Locale commerciale',
      'confiscato',
      'Corso Numistrano, Nicastro, Lamezia Terme',
      '',
      '',
      'Foglio 13, particella 155, sub 2',
      'https://www.benisequestraticonfiscati.it/',
      38.9772000,
      16.3088000,
      'Corso Numistrano, Nicastro',
      'nicastro'
    )
) AS demo(
  slug,
  denominazione,
  description,
  tipologia,
  status,
  indirizzo,
  assegnatario,
  destinazione_uso,
  dati_catastali,
  official_url,
  latitude,
  longitude,
  geo_address,
  geo_quartiere
)
WHERE asset.slug = demo.slug
  AND asset.denominazione = demo.denominazione
  AND asset.description = demo.description
  AND asset.tipologia = demo.tipologia
  AND asset.status = demo.status
  AND asset.indirizzo = demo.indirizzo
  AND asset.assegnatario = demo.assegnatario
  AND asset.destinazione_uso = demo.destinazione_uso
  AND asset.dati_catastali = demo.dati_catastali
  AND asset.official_url IS NOT DISTINCT FROM demo.official_url
  AND asset.latitude IS NOT DISTINCT FROM demo.latitude
  AND asset.longitude IS NOT DISTINCT FROM demo.longitude
  AND asset.geo_address IS NOT DISTINCT FROM demo.geo_address
  AND asset.geo_quartiere IS NOT DISTINCT FROM demo.geo_quartiere
  AND asset.source = 'manual'
  AND asset.source_id IS NULL
  AND asset.geo_source = 'manual'
  AND asset.geo_manual = true
  AND asset.geo_verify = false
  AND asset.notes = ''
RETURNING asset.id;
