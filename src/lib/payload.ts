import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Payload's Local API — runs in-process against the database, so server
 * components read content without an HTTP round-trip.
 */
export const getPayloadClient = async () => getPayload({ config: configPromise })
