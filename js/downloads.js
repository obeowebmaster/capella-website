/** A Q&D transformation from markdown to html */
var markdown = {

    toHtml: function(md) {
        md = md.replace(new RegExp('#### ([^\n]+)\r?\n', 'g'), "<h4>$1</h4>");
        md = md.replace(new RegExp('### ([^\n]+)\r?\n', 'g'), "<h3>$1</h3>");
        md = md.replace(new RegExp('## ([^\n]+)\r?\n', 'g'), "<h2>$1</h2>");
        md = md.replace(new RegExp('# ([^\n]+)\r?\n', 'g'), "<h1>$1</h1>");
        md = md.replace(new RegExp('\\*\\*([^\\*]+)\\*\\*', 'g'), "<b>$1</b>");
        md = md.replace(new RegExp(' *\\*([^\n]+)\r?\n', 'g'), "<li>$1</li>");
        md = md.replace(new RegExp('\r?\n', 'g'), "<br/>");
        md = md.replace(new RegExp("!\\[([^\\]]+)\\]\\(([^\\)]+)\\)", 'g'), "<img width=\"300px\" title=\"$1\" src=\"$2\"/>");
        md = md.replace(new RegExp("\\[([^\\]]+)\\]\\(([^\\)]+)\\)", 'g'), "<a title=\"$1\" href=\"$2\">$1</a>");
        return md;
    }

}

var downloads = {

    updateMainLink: function(mainLinkId, data, product) {
        let mainId = "windows";
        let title = "Get {0} {1} for {2} {3}".format(product.name, product.version, data.lang[mainId].text, data.lang["main"].text);
        let mainLink = '<p><a class="wow fadeInUp animated btn btn-default animated" data-wow-delay=".6s" href="{0}" style="visibility: visible; animation-delay: 0.6s; animation-name: fadeInUp;" onClick="ga(\'send\', \'event\', \'{1}\', \'{2}\', \'{3}\');"><i class="fa fa-download" aria-hidden="true"></i> {4}</a></p>'.format(product.links[mainId].main, product.key, data.versionBranch, data.lang[mainId].key, title);
        document.getElementById(mainLinkId).innerHTML += mainLink;
    },

    updatePlatformLinks: function(platformLinksId, data, product) {
        let lis = Object.keys(product.links).map(function (k) {
            let link = product.links[k];
            let linkss = Object.keys(link).map(function (key) { return '<a href="{0}" onClick="ga(\'send\', \'event\', \'{1}\', \'{2}\', \'{3}\');">{4}</a>'.format(link[key], product.key, data.versionBranch, data.lang[k].key, data.lang[key].text);  }).join(" - ");
            return '<p class="txt_white wow fadeInUp animated" data-wow-delay=".4s"><i class="{0}" aria-hidden="true"></i> {1}<br/>{2}</p>'.format(data.lang[k].icon, data.lang[k].text, linkss);
        }).join("");
        document.getElementById(platformLinksId).innerHTML += lis;
    },

    expandSectionData: function(event, allData, data, addonKey, dataKey) {
        let addon = allData.addons.find(function (a) { return a.key == addonKey; });
        let type = allData.lang[dataKey]["target-type"];
        let id="#collapse-notes-"+addonKey;
        
        if (type == "embed") {
            let content = '<h3>'+allData.lang[dataKey].text+'</h3>';
            content += downloads.createKeysLinks(allData, addon, addon.download[dataKey], Object.keys(addon.download[dataKey]).filter(x => x != "notes"));
            content += addon.download[dataKey].notes;
            document.getElementById(id.substring(1)).innerHTML = content;
            $(id).collapse('show');
        
        } else if (type == "json") {
            $.getJSON(data["url"], function(data2) {
                data2 = data2.filter(x => !x.prerelease && x.tag_name != undefined).sort( function(a, b) {return b.tag_name.localeCompare(a.tag_name)} );
                data2.forEach(e => e.majorMinor = e.tag_name.substring(0, e.tag_name.lastIndexOf(".")));
                let ddd = data2.map (x => x.majorMinor).join(" - ");
                data2 = data2.reduce((x,v)=>{
                    if (!x.map(k => k.majorMinor).includes(v.majorMinor)) {
                        x.push(v);
                    }
                    return x;
                }, []).slice(0, 2);

                console.log(data2);
                
                let activeTag = data2.map (x => x.tag_name)[0];
                let releases = data2.map(v => '<li class="nav-item {0}"><a class="nav-pill" id="{1}-tab" role="tab" href="{1}-{2}">{1}</a></li>'.format(v.tag_name == activeTag ? "active":"", v.tag_name, addonKey)).join("");
                let releaseContent = data2.map(v => '<div role="tabpanel" class="tab-pane {0}" id="{1}-{2}" aria-labelledby="{1}-tab">'.format(v.tag_name == activeTag ? "active":"", v.tag_name, addonKey)+markdown.toHtml(v.body)+'</div>').join("");
                let nav = '<ul class="nav nav-pills" id="myTabcc" role="tablist">'+releases+'</ul>';
                let tabs = '<div id="myTabcc2" class="tab-content">'+releaseContent+'</div>';
                $(id).html('<div id="cccc">'+ nav + tabs+'</div>');

                $(id).collapse('show');
                $('#myTabcc a').on('click', function (e) {
                    e.preventDefault();
                    $(this).tab('show');
                    [...document.getElementsByClassName("tab-pane")].forEach(x => x.setAttribute("class", "tab-pane"));
                    document.getElementById(e.target.getAttribute("href")).setAttribute("class", "tab-pane active");
                });
            });

        } else if (type == "jsonLab") {
            let proceed = function(data2) {
                data2 = data2.filter(x => !x.prerelease && x.tag_name != undefined).sort( (a, b) => {return b.tag_name.localeCompare(a.tag_name)} );
                data2.forEach(e => e.majorMinor = e.tag_name.substring(0, e.tag_name.lastIndexOf(".")));
                let ddd = data2.map (x => x.majorMinor).join(" - ");
                data2 = data2.reduce((x,v)=>{
                    if (!x.map(k => k.majorMinor).includes(v.majorMinor)) {
                        x.push(v);
                    }
                    return x;
                }, []).slice(0, 3);

                console.log(data2);
                
                let activeTag = data2.map (x => x.tag_name)[0];
                let releases = data2.map(v => '<li class="nav-item {0}"><a class="nav-pill" id="{1}-tab" role="tab" href="{1}">{1}</a></li>'.format(v.tag_name == activeTag ? "active":"", v.tag_name)).join("");
                let releaseContent = data2.map(v => {
                    let links = v.assets.links.map(x => '<a href="{1}">{0}</a>'.format(x.name, x.url)).join(" - ");
                    return '<div role="tabpanel" class="tab-pane {0}" id="{1}" aria-labelledby="{1}-tab">'.format(v.tag_name == activeTag ? "active":"", v.tag_name)+links+"<br/>"+markdown.toHtml(v.description)+'</div>'
                }).join("");
                let nav = '<ul class="nav nav-pills" id="myTabcc" role="tablist">'+releases+'</ul>';
                let tabs = '<div id="myTabcc2" class="tab-content">'+releaseContent+'</div>';
                $(id).html('<div id="cccc">'+ nav + tabs+'</div>');

                $(id).collapse('show');
                $('#myTabcc a').on('click', function (e) {
                    e.preventDefault();
                    $(this).tab('show');
                    [...document.getElementsByClassName("tab-pane")].forEach(x => x.setAttribute("class", "tab-pane"));
                    document.getElementById(e.target.getAttribute("href")).setAttribute("class", "tab-pane active");
                });

            };

            $.getJSON(data["url"][0].url, function(data2) {
                if (data["url"][1].url != undefined) {
                    data2.forEach(d => d.tag_name = d.tag_name+"-"+data["url"][0].name);
                    $.getJSON(data["url"][1], function(data3) {
                        data3.forEach(d => d.tag_name = d.tag_name+"-"+data["url"][1].name);
                        data2 = data2.concat(data3);
                        proceed(data2);
                    });
                } else {
                    proceed(data2);
                }
            });
        } else if (type == "md") {
            $.get(data["url"], function(data2) {
                document.getElementById(id.substring(1)).innerHTML = markdown.toHtml(data2);
                $(id).collapse('show');
            })
        } 
    }, 

    expandSection: function(event) {
        let addonKey = (event.target.getAttribute("addon-key"));
        let dataKey = (event.target.getAttribute("data-key"));

        $.getJSON('json/downloads.json', function(data) {
            let addon = data.addons.find(function (a) { return a.key == addonKey; });
            downloads.expandSectionData(event, data, addon.download[dataKey], addonKey, dataKey);
        });
    },

    createKeysLinks: function(data, addon, download, keys, icons) {
            let links = keys.map(function(k) {
            let icon = icons == undefined && data.lang[k].icon ? '<i class="pl-2 {0}" aria-hidden="true"></i>'.format(data.lang[k].icon) : "";

            let additions = "";
            
            let toA = function(url, addonKey, dataKey, additions, text, icon, target, branch) {
                if (target == "_expand") {
                    additions = ' onclick="downloads.expandSection(event)" ';
                } else if (target != undefined) {
                    additions = ' target="'+target+'" href="'+url+'" onclick="ga(\'send\', \'event\', \'Capella\', \''+branch+'\', \''+addonKey+'\');"';
                }
                return '<a addon-key="{0}" data-key="{1}" {2}>{3}{4}</a>'.format(addonKey, dataKey, additions, text, icon);
            }
            let url = download[k];
            if (Array.isArray(url)) {
                return data.lang[k].text + "s"+ icon + " (" + url.map(x => toA(x.url, addon.key, k, additions, x.name, icon, data.lang[k].target, data.versionBranch) ).join(" + ")+")";
            }
            return toA(url, addon.key, k, additions, data.lang[k].text, icon, data.lang[k].target, data.versionBranch);
        
         }).join(" - ");
         return links;
    },
  
    updateMainPageAddonLinks: function(data) {
        let addons = "";
        let sample = "";
        let filteredAddons = data.addons.filter(function (a) { return a.showOnMainPage; });
        for (i in filteredAddons) {
            let addon = filteredAddons[i];
            let keys = Object.keys(addon.download);
            let links = downloads.createKeysLinks(data, addon, addon.download, Object.keys(addon.download), false);
            let header = [];
            if (addon.contact) {
                header.push('Contact: '+addon.contact);
            }
            if (addon.licence) {
                header.push('License: '+addon.licence);
            }
            header=header.join(" - ");
            let information = '<p><i>{0}</i></p><p>{1}</p>'.format(header, addon.description);
            
            let compatible = addon.compatibleWithCurrentVersion === false ? '<button role="button" class="fa fa-exclamation-triangle btn-link btn-xs alert-compatibility" data-toggle="tooltip" data-placement="bottom" title="{0}" ></button>'.format(data.lang.compatibility.text) : "";
            let information2 = '<button role="button" class="fa fa-info-circle btn-link btn-xs " data-toggle="popover" data-trigger="focus" data-placement="bottom" title="{0}" data-content="{1}"></button>'.format(addon.name, information);
            
            let addonName = addon.isViewpoint ? addon.name + " Viewpoint" : addon.name;
            
            let sections = keys.filter(k => data.lang[k].target == "_expand").map(function(k) {
                let div = '<div class="collapse notes-section" id="collapse-notes-'+addon.key+'"></div>';
                return div;
            }).join("");
            
            let result = '<p class="wow fadeInUp animated" data-wow-delay=".3s">{0} {1}<br/><span class="small pl-2">{2}{3}</span></p>{4}<br/>'.format(addonName, information2, compatible, links, sections);

            if (addon.isSample) {
                sample += result;
            } else {
                addons += result;
            }
      }
      document.getElementById("capella-addons").innerHTML = addons;
      document.getElementById("capella-sample").innerHTML = sample;
      
      $('[data-toggle="popover"]').popover( { html: true, container: 'body' });
      $('[data-toggle="tooltip"]').tooltip();
    },

    proceedMainJson() {
        $.getJSON('json/downloads.json', function(data) {

            downloads.updateMainLink("capellaMainLink", data, data.capella);
            downloads.updatePlatformLinks("capellaPlatformLinks", data, data.capella);
    
            downloads.updateMainLink("capellaStudioMainLink", data, data.capellaStudio);
            downloads.updatePlatformLinks("capellaStudioPlatformLinks", data, data.capellaStudio);
    
            downloads.updateMainPageAddonLinks(data);
    
      });
    },
    
    proceedAddonsJson() {
        $.getJSON('json/downloads.json', function(data) {
            let eplAddons = data.addons.filter(function(a) { return a.licence == 'EPL' && !a.isSample }); //Open-source add-ons
            let commercialAddons = data.addons.filter(function(a) { return a.licence == 'Commercial' }); //Commercial add-ons
            let sampleAddons = data.addons.filter(function(a) { return a.isSample });

            if (eplAddons.length != 0) {
                downloads.addTitleToDiv("accordion-opensource-addons", "Open-Source Add-ons");
            for (addon in eplAddons) {
                downloads.addAddonSection(data, eplAddons[addon], "accordion-opensource-addons");
            }
            }

            if (commercialAddons.length != 0) {
                downloads.addTitleToDiv("accordion-commercial-addons", "Commercial Add-ons");
            for (addon in commercialAddons) {
                downloads.addAddonSection(data, commercialAddons[addon], "accordion-commercial-addons");
            }
            }
            
            if (sampleAddons.length != 0) {
                downloads.addTitleToDiv("accordion-sample-addons", "Sample Add-ons", "Add-ons that show how to start developing add-ons for Capella using Capella Studio");
            
            for (addon in sampleAddons) {
                downloads.addAddonSection(data, sampleAddons[addon], "accordion-sample-addons");
            }
            }
        });
    },

    addTitleToDiv(divId, title, description) {
      let desc = description == undefined ? "": description;
      document.getElementById(divId).innerHTML += "<div><h1>" + title + "</h1>" + desc + "</div>";
    },

    addAddonSection(data, addon, divId) {
      let keys = Object.keys(addon.download);
      let links = downloads.createKeysLinks(data, addon, addon.download, Object.keys(addon.download) );
           let header = [];
           if (addon.contact) {
              header.push("Contact: "+addon.contact);
           }
           if (addon.licence) {
              header.push("License: "+addon.licence);
           }
           if (addon.tags) {
               let tags='';
               for (tag in addon.tags) {
                   tags+=' <button class="tag">'+addon.tags[tag]+'</button>';
              }
              header.push(tags);
           }
           header=header.join(" - ");

           let compatible = addon.compatibleWithCurrentVersion === false ? '<button role="button" class="fa fa-exclamation-triangle btn-link btn-xs alert-compatibility" data-toggle="tooltip" data-placement="bottom" title="{0}" ></button>'.format(data.lang.compatibility.text) : "";
           let addonName = addon.isViewpoint ? addon.name + " Viewpoint" : addon.name;
           let fragment = addon.fragment != undefined ? addon.fragment : addon.key;
           
           let dropdown = '<div class="accordion-heading"><a class="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion2" href="#{0}"><h3>{1}</h3><span class="fa fa-caret-down txt_yellow">&nbsp;</span><span class="descr txt_lightest_grey">{2}</span></a></div>'.format(fragment, addonName, header);

           let sections = keys.filter(function(k) { return data.lang[k].target == "_expand" }).map(function(k) {
              let div = '<div class="collapse notes-section" id="collapse-notes-'+addon.key+'"><h3>'+data.lang[k].text+'</h3>'+downloads.createKeysLinks(data, addon, addon.download[k])+addon.download[k]["notes"]+'</div>';
              return div;
           }).join("");

           let content = '<div id="{0}" class="accordion-body collapse" style="height: 0px;"><div class="accordion-inner">{1}<p>{2}{3}</p>{4}</div></div>'.format(fragment, addon.description, compatible, links, sections);
           let result = '<div class="accordion-group">{0}{1}</div>'.format(dropdown, content);
           
           document.getElementById(divId).innerHTML += result;

        $('[data-toggle="popover"]').popover( { html: true, container: 'body' });
        $('[data-toggle="tooltip"]').tooltip();
      }

}
