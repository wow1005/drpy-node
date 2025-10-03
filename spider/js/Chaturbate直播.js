/*
@header({
  searchable: 1,
  filterable: 1,
  quickSearch: 0,
  title: 'chaturbate',
  author: 'wow',
  '类型': '影视',
  lang: 'ds'
})
*/

var rule = {
    类型: '影视',
    title: 'chaturbate',
    author: 'wow',
    host: 'https://chaturbate.com',
    proxyUrl: '', //cf代理
    url: '/api/ts/roomlist/room-list/?genders=fyclass&hashtags=fyfilter&limit=90&ref=all&require_fingerprint=false',
    detailUrl: '/fyid',
    filter_url: '{{fl.tag}}',
    searchUrl: '/api/ts/roomlist/room-list/?keywords=**&limit=90&require_fingerprint=false',
    class_name: 'Women&Men&Couples&Trans',
    class_url: 'f&m&c&t',
    filter: 'H4sIAAAAAAACA61WO5LcIBS8i+JJbCeuvYprA0CMREmCMaDdndqa2NfwBXwFH8e+hiWgHwoGpLGddb/Wj/fpp/fm3Dx9eW8GeW2eGs+65tRoNsmF/Pr+7fePnwt/YeMsw1V6CUtu9HWNEr6dosJVx43hLolEoU/Mz1YmNRHS1HiGskLEP3xO0QUgxpxiOoUjhuK+zsr6JCUCTcvXJKyInqXZiEetEPGReaVZUhKB1jNlkYGIKQMc71gRol5KfG6AiJ9nMUxM9EojKdsInWlQmhKeCLQL0/7aG4f7M8cVrZQX31vDkJVNYFM35jZVWwm9fWLj6JWHnPmmckOu3JBPJyXeGSB985JKHCdiUqzs9HICiKD0nVZ55Xp8aGJQxWxf8NyIoXTSTtQwiZBmPB4YIOJXM+suCRFDsbLtJWuTBgZV6TY3ZyK359vzqZkenLNyl3MuqMvEtorCiCGXMbBcjYmbK9UjkNqMTbMTI81qJPv971+VxhdEfKQGLWtbPC9iqmk/c05FjWS/QjWf6aj3uk3nlXo1dPsmq5kf68myV56t1AK3JULfb7Tz0m7eu43kfp+o26cc/YjeWFHOyHo7ZSQQcjrzIjU5CFi1n5M2azEjbRHXvTbYqNl6qtn14R2PDJMlHp2skudLx/NhwWpTsrfxyvWv7Zcjnn0/w6UtKsx8oWlO5MjO5K1DkwW4t9HKnlWbyftbs+wy9zu/NMNlnyj6aHEb1j22tAn/ba/V9n/NVS+y6xSdHOzAXg8z5f/btqptnr18Om8l1YIodaFlGmLEe27yd/O4vwWcHM9uzheAHvWJe97ilHNU9oB3+v/Q3+T+H2P5/6w2GaJftoryeVcnCv1T+7bEMAJgOcNmkJTdFR/p/vseWPaNkkM8+Nfukf0V5WlbjktJjaT6L7VM2e0Pi23Yo30NAAA=',
    searchable: 1,
    quickSearch: 0,
    filterable: 1,
    headers: {
        'User-Agent': 'MOBILE_UA'
    },
    timeout: 5000,
    play_parse: true,
    /*class_parse: async function() {
        let { input, pdfa, pdfh } = this;
        let urls = ['female', 'male', 'couple', 'trans'];
        let filterObj = {};
        let urlArr = urls.map(it => {
            return {
                url: `${rule.proxyUrl}${rule.host}/tags/${it}`,
                options: {
                    timeout: 5000,
                    headers: rule.headers
                }
            }
        });
        let htmlArr = await batchFetch(urlArr);
        htmlArr.forEach((it, i) => {
            let list = pdfa(it, '#mobile-tags-container&&.mobile-tag-row');
            filterObj[urls[i].charAt(0)] = [{
                    key: 'tag',
                    name: '标签',
                    value: list.map(item => {
                        return {
                            n: pdfh(item, 'a&&title'),
                            v: pdfh(item, 'a&&title')
                        }
                    })
            }];
        });
        //log(JSON.stringify(filterObj));
        return {
            filters: filterObj
        }
    },*/
    推荐: async function() {},
    一级: async function(tid, pg, filter, extend) {
        let {
            input,
            MY_PAGE
        } = this;
        let d = [];
        let resp = await request(`${rule.proxyUrl}${input}&offset=${(MY_PAGE-1)*90}`, {
            header: rule.headers
        });
        let list = JSON.parse(resp).rooms;
        list.forEach((it) => {
            d.push({
                vod_name: it.username,
                vod_pic: it.img,
                vod_remarks: it.current_show,
                vod_id: it.username
            })
        });
        return d;
    },
    二级: async function(ids) {
        let {
            input
        } = this;
        let vod = {
            vod_id: ids[0],
            vod_name: ids[0]
        };
        try {
            let resp = await request(`${rule.proxyUrl}${input}`, {
                headers: rule.headers
            });

            let data = cut(resp, 'window.initialRoomDossier = ', ';').split(';')[0];
            let json = JSON.parse(JSON.parse(data));
            log('>>>>' + json.hls_source)
            vod.vod_play_from = 'wow';
            vod.vod_play_url = input + '$' + json.hls_source;
        } catch (e) {
            vod.vod_play_from = '暂无资源';
            vod.vod_play_url = '暂无资源$0';
        }
        return vod;
    },
    搜索: async function(wd, quick, pg) {
        let {
            input
        } = this;
        let searchFn = rule.一级.bind(this);
        return await searchFn();
    },
    lazy: async function(flag, id, flags) {
        let {
            input
        } = this;
        try{
            const streams = await parseM3U8Streams1(input);
            if (streams.length > 0) {
                input = streams;
            }
        } catch(e){}

        return {
            parse: 0,
            url: input
        }
    }
};

async function parseM3U8Streams(m3u8Url) {
    try {
        const m3u8Content = await request(m3u8Url);

        let basePath = m3u8Url;
        if (!basePath.endsWith('/')) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        }
        
        const lines = m3u8Content.split('\n');
        const result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXT-X-STREAM-INF:')) {
                const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
                
                if (resolutionMatch) {
                    const resolution = resolutionMatch[1];
                    
                    // 查找下一个非空且非元数据的行作为链接
                    let j = i + 1;
                    while (j < lines.length) {
                        const relativeLink = lines[j].trim();
                        if (relativeLink && !relativeLink.startsWith('#')) {
                            // 构建完整的URL
                            const fullUrl = relativeLink.startsWith('http') 
                                ? relativeLink 
                                : basePath + relativeLink;
                            
                            result.push(resolution, fullUrl);
                            i = j; // 更新索引位置
                            break;
                        }
                        j++;
                    }
                }
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Error processing M3U8:', error);
        return [];
    }
}

async function parseM3U8Streams1(m3u8Url) {
    try {
        const m3u8Content = await request(m3u8Url);

        let basePath = m3u8Url;
        if (!basePath.endsWith('/')) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        }
        
        const lines = m3u8Content.split('\n');
        const streams = []; // 临时存储流信息
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXT-X-STREAM-INF:')) {
                const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
                
                if (resolutionMatch) {
                    const resolution = resolutionMatch[1];
                    
                    // 查找下一个非空且非元数据的行作为链接
                    let j = i + 1;
                    while (j < lines.length) {
                        const relativeLink = lines[j].trim();
                        if (relativeLink && !relativeLink.startsWith('#')) {
                            // 构建完整的URL
                            const fullUrl = relativeLink.startsWith('http') 
                                ? relativeLink 
                                : basePath + relativeLink;
                            
                            // 计算分辨率数值（宽×高）
                            const [width, height] = resolution.split('x').map(Number);
                            const resolutionValue = width * height;
                            
                            streams.push({
                                resolution,
                                url: fullUrl,
                                resolutionValue // 用于排序
                            });
                            
                            i = j; // 更新索引位置
                            break;
                        }
                        j++;
                    }
                }
            }
        }
        
        // 按分辨率从高到低排序
        streams.sort((a, b) => b.resolutionValue - a.resolutionValue);
        
        const result = [];
        for (const stream of streams) {
            result.push(stream.resolution, stream.url);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error processing M3U8:', error);
        return [];
    }
}
