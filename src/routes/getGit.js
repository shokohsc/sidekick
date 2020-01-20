'use strict';

const express = require('express');
const config = require('../../src/config');
const fetchGitReleases = require('../services/fetchGitReleases');
const fetchGitBranches = require('../services/fetchGitBranches');

const router = new express.Router();

router.get('/git', async (request, response) => {

    const author = request.query.author;
    const repository = request.query.repository;
    const domain = void 0 === request.query.domain ? 'github.com' : request.query.domain;
    const limit = void 0 === request.query.limit ? 2 : request.query.limit;
    const repositoryUrl = 'https://' + domain + '/' + author + '/' + repository + '.git';

    const headRegex = /(.+)refs\/heads\/(?<head>.+$)/;
    const tagRegex = /(.+)refs\/tags\/(?<tag>.+$)/;
    let heads = [];
    let tags = [];

    let branches = await fetchGitBranches(repositoryUrl);
    let releases = await fetchGitReleases(repositoryUrl);

    branches.split('\n').forEach(element => {
        const result = headRegex.exec(element);
        if (result && result.groups && result.groups.head && ! /\^{}/.test(result.groups.head)) {
            heads.push(result.groups.head);
        }
    });
    heads = heads.filter(branch => 'master' !== branch);

    releases.split('\n').forEach(element => {
        const result = tagRegex.exec(element);
        if (result && result.groups && result.groups.tag && ! /\^{}/.test(result.groups.tag)) {
            tags.push(result.groups.tag);
        }
    });
    tags = tags.sort((a, b) => {
        return parseInt(a.replace(/v|\./g, '')) > parseInt(b.replace(/v|\./g, '')) ? -1 : 1;
    })
    .slice(0, limit);

    response.status(200);
    response.send({
        'branches': heads,
        'releases': tags
    });
});

module.exports = router;
