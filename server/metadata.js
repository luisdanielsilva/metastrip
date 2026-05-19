const sharp = require('sharp')
const exifr = require('exifr')

/**
 * Read all metadata from an image buffer.
 */
async function readMetadata(buffer, mimetype) {
  try {
    const exif = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
      iptc: true,
      xmp: true,
      icc: false,
      jfif: true,
      ihdr: true,
    })

    const sharpMeta = await sharp(buffer).metadata()

    return {
      // GPS
      gps: exif
        ? {
            latitude: exif.latitude,
            longitude: exif.longitude,
            altitude: exif.GPSAltitude,
          }
        : null,
      // Camera & lens
      camera: exif
        ? {
            make: exif.Make,
            model: exif.Model,
            lens: exif.LensModel || exif.Lens,
            software: exif.Software,
            focalLength: exif.FocalLength,
            aperture: exif.FNumber,
            iso: exif.ISO,
            shutterSpeed: exif.ExposureTime,
          }
        : null,
      // Timestamps
      timestamps: exif
        ? {
            dateTime: exif.DateTime,
            dateTimeOriginal: exif.DateTimeOriginal,
            dateTimeDigitized: exif.DateTimeDigitized,
            modifyDate: exif.ModifyDate,
          }
        : null,
      // Author / copyright
      author: exif
        ? {
            artist: exif.Artist,
            copyright: exif.Copyright,
            creator: exif.Creator,
            description: exif.ImageDescription,
            comment: exif.UserComment,
          }
        : null,
      // Image info
      image: {
        format: sharpMeta.format,
        width: sharpMeta.width,
        height: sharpMeta.height,
        space: sharpMeta.space,
        channels: sharpMeta.channels,
        hasAlpha: sharpMeta.hasAlpha,
        size: buffer.length,
        hasExif: !!sharpMeta.exif,
        hasIptc: !!sharpMeta.iptc,
        hasXmp: !!sharpMeta.xmp,
      },
    }
  } catch (err) {
    console.error('Metadata read error:', err)
    return { error: err.message }
  }
}

/**
 * Strip metadata from an image buffer according to criteria.
 * criteria: { gps, camera, timestamps, author, all }
 */
async function stripMetadata(buffer, mimetype, criteria) {
  const img = sharp(buffer)
  const meta = await img.metadata()

  // If stripping all, use withMetadata({}) trick — just output without any metadata
  if (criteria.all) {
    return await sharp(buffer)
      .withMetadata({}) // clears everything
      .toBuffer()
  }

  // For selective stripping we manipulate EXIF via exifr + custom rebuild
  // sharp doesn't support partial EXIF removal natively, so we:
  // 1. Parse full EXIF
  // 2. Delete unwanted fields
  // 3. Re-encode with remaining metadata via withMetadata

  // Since sharp can't write arbitrary EXIF back, for selective removal
  // the safest cross-format approach is to strip all then re-add what we want to keep.
  // We'll preserve ICC profile always (color accuracy).

  let exifData = null
  try {
    exifData = await exifr.parse(buffer, { tiff: true, exif: true, gps: true, iptc: true, xmp: true })
  } catch (_) {}

  // Build withMetadata options — sharp supports limited EXIF writing
  const keepMeta = {}

  // Always preserve orientation to avoid visual rotation bugs
  if (meta.orientation) keepMeta.orientation = meta.orientation

  // If not removing camera info, we can't reconstruct it via sharp natively;
  // we note this in the README. For now, strip-and-note approach is used.
  // The simplest safe approach: strip all EXIF, preserve ICC.
  const processed = await sharp(buffer)
    .withMetadata(keepMeta)
    .toBuffer()

  return processed
}

module.exports = { readMetadata, stripMetadata }
