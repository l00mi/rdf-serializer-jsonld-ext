/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const sinkTest = require('rdf-sink/test')
const Readable = require('readable-stream')
const JsonLdSerializerExt = require('..')

describe('rdf-serializer-jsonld-ext', () => {
  sinkTest(JsonLdSerializerExt, {readable: true})

  it('should support string output', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object1'))

    const jsonldString = JSON.stringify([{
      '@id': '@default',
      '@graph': {
        '@id': 'http://example.org/subject',
        'http://example.org/predicate': 'object1'
      }
    }])

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializerExt({outputFormat: 'string'})
    const stream = serializer.import(input)

    let result

    stream.on('data', (data) => {
      result = data
    })

    return rdf.waitFor(stream).then(() => {
      assert.equal(result, jsonldString)
    })
  })

  it('should support compact', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object1'))

    const context = {
      'ex': 'http://example.org/'
    }

    const jsonld = {
      '@context': context,
      '@id': '@default',
      '@graph': [{
        '@id': 'ex:subject',
        'ex:predicate': 'object1'
      }]
    }

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializerExt({compact: true, context: context})
    const stream = serializer.import(input)

    let result

    stream.on('data', (data) => {
      result = data
    })

    return rdf.waitFor(stream).then(() => {
      assert.deepEqual(result, jsonld)
    })
  })

  it('should support prefixes', () => {
    const quad = rdf.quad(
      rdf.namedNode('http://example.org/subject'),
      rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object1'))

    const context = {
      'ex': 'http://example.org/'
    }

    const jsonld = {
      '@context': context,
      '@id': '@default',
      '@graph': [{
        '@id': 'ex:subject',
        'ex:predicate': 'object1'
      }]
    }

    const input = new Readable()

    input._readableState.objectMode = true

    input._read = () => {
      input.push(quad)
      input.push(null)
    }

    const serializer = new JsonLdSerializerExt({compact: true})
    const stream = serializer.import(input)

    input.emit('prefix', 'ex', rdf.namedNode('http://example.org/'))

    let result

    stream.on('data', (data) => {
      result = data
    })

    return rdf.waitFor(stream).then(() => {
      assert.deepEqual(result, jsonld)
    })
  })
})
