function lstvis_kb_b_string(value) {
  return '' + (value / 1024).toFixed(2) + 'kb&nbsp(' + value + 'b)';
}

/******************************************************************************/

function lstvis_parse(input) {
  StateEnum = {
    Begin : 1,
    Sections : 2,
    Symbols : 3,
  };

  var state = StateEnum.Begin;
  var lines = input.split('\n');
  var result = {};

  result['sections'] = [];
  result['symbols'] = [];
  result['data_symbols'] = 0;
  result['data_symbols_size'] = 0;
  result['instructions_symbols'] = 0;
  result['instructions_symbols_size'] = 0;
  result['biggest_symbol_size'] = 0;
  result['biggest_section_size'] = 0;


  $.each(lines, function(n, line) {
    /*************************************************************** filename */
    if(state == StateEnum.Begin) {
      filename_regex = /^(.+): +file format .+$/;

      if(line.match(filename_regex)) {
        result['filename'] = line.replace(filename_regex, '$1');
      }
    }

    /*************************************************************** sections */
    if(line.match(/^Sections:$/)) {
      state = StateEnum.Sections;
    }

    if(state == StateEnum.Sections) {
      section_regex = /^ *(\d+) (\.[a-z_]+) +([a-f0-9]+) +[a-f0-9]+ +[a-f0-9]+ +[a-f0-9]+ + \d..\d$/;

      if(line.match(section_regex)) {
        section = {};
        section['id'] = line.replace(section_regex, '$1');
        section['name'] = line.replace(section_regex, '$2');
        section['size_hex'] = line.replace(section_regex, '$3');
        section['size_dec'] = parseInt(section['size_hex'], 16);

        result['sections'].push(section);
      }
    }

    /**************************************************************** symbols */
    if(line.match(/^Disassembly of section [.a-z]+:$/)) {
      state = StateEnum.Symbols;
    }

    if(state == StateEnum.Symbols) {
      header_regex = /^([a-f0-9]+) <([\._a-zA-Z0-9]+)>:$/;
      data_regex = /^ +[a-f0-9]+:\t([ a-f0-9]+) +([^\t]+)$/;
      instructions_regex = /^ +[a-f0-9]+:\t([ a-f0-9]+)\t([a-z]+.+)$/

      if(line.match(header_regex)) {
        symbol = {};
        symbol['address_hex'] = line.replace(header_regex, '$1');
        symbol['address_dec'] = parseInt(symbol['address_hex'], 16);
        symbol['name'] = line.replace(header_regex, '$2');
        symbol['content_hex'] = '';
        symbol['content_ascii'] = '';
        symbol['code'] = '';
        result['symbols'].push(symbol);
      }
      else if(line.match(data_regex)) {
        symbol = result['symbols'][result['symbols'].length - 1];
        if(symbol) {
          symbol['content_hex'] += line.replace(data_regex, '$1').trim(' ') + ' ';
          symbol['content_ascii'] += line.replace(data_regex, '$2');
          symbol['type'] = 'data';
        }
      }
      else if(line.match(instructions_regex)) {
        symbol = result['symbols'][result['symbols'].length - 1];
        if(symbol) {
          symbol['content_hex'] += line.replace(instructions_regex, '$1').trim(' ') + ' ';
          symbol['content_ascii'] += line.replace(instructions_regex, '$2') + '\n';
          symbol['type'] = 'instructions';
        }
      }
      else {
        symbol = result['symbols'][result['symbols'].length - 1];
        if(symbol) {
          if(line.length > 0) {
            symbol['code'] += line + '\n';
          }
        }
      }
    }
  });

  console.log('parsed');
  console.log(result);

  return result;
};

/******************************************************************************/

function lstvis_analyze(lstvis_data) {
  // sort sections by size
  lstvis_data['sections'].sort(function(a,b) {
    return b['size_dec'] - a['size_dec'];
  });

  // getting biggest section
  if(lstvis_data['sections'].length > 0) {
    lstvis_data['biggest_section_size'] = lstvis_data['sections'][0]['size_dec'];
  }

  // calculate size of symbol contents
  $.each(lstvis_data['symbols'], function(n, symbol) {
    symbol['size_dec'] = symbol['content_hex'].length / 3;
  });

  // counting symbols and adding up symbol sizes
  $.each(lstvis_data['symbols'], function(n, symbol) {
    if(symbol['type'] == 'instructions') {
      lstvis_data['instructions_symbols']++;
      lstvis_data['instructions_symbols_size'] += symbol['size_dec'];
    }
    if(symbol['type'] == 'data') {
      lstvis_data['data_symbols']++;
      lstvis_data['data_symbols_size'] += symbol['size_dec'];
    }
  });

  // sort symbols by size
  lstvis_data['symbols'].sort(function(a,b) {
    return b['size_dec'] - a['size_dec'];
  });

  // getting biggest symbol
  if(lstvis_data['symbols'].length > 0) {
    lstvis_data['biggest_symbol_size'] = lstvis_data['symbols'][0]['size_dec'];
  }

  console.log('analyzed');
  console.log(lstvis_data);

  return lstvis_data;
}

/******************************************************************************/

function lstvis_create_section_info(section) {
  return $('<p>', {
    class: 'section-info',
    html: 'Section ' + section['id'] + ' ' + section['name'] + '<br />' + 
      'Size: ' + lstvis_kb_b_string(section['size_dec'])});
}

/******************************************************************************/

function lstvis_create_symbol_info(symbol) {
  return $('<p>', {
    class: 'symbol-info',
    html: 
      'Size: ' + lstvis_kb_b_string(symbol['size_dec']) +
      (symbol['code'].length > 0 ?
        '<h4>Source Code</h4>' +
        '<pre>' + symbol['code'] + '</pre>' : '') +
      '<h4>Built Plain Text</h4>' +
      '<pre>' + symbol['content_ascii'] + '</pre>' +
      '<h4>Built Hex Bytes</h4>' +
      '<p class="monospace">' + symbol['content_hex'] + '</p>'});
}

/******************************************************************************/

function lstvis_render(result_element, lstvis_data) {
  result_element.append($('<h1>', { html: 'Analysis Results'}));

  /***************************************************************** overview */
  result_element.append($('<h3>', { html: 'Overview'}));
  result_element.append($('<p>', { html: 'Filename: ' + lstvis_data['filename']}));
  result_element.append($('<p>', { html: 'Data Symbols: ' + 
    lstvis_data['data_symbols'] + ' Size: ' + 
    lstvis_kb_b_string(lstvis_data['data_symbols_size'])}));
  result_element.append($('<p>', { html: 'Instruction Symbols: ' + 
    lstvis_data['instructions_symbols'] + ' Size: ' + 
    lstvis_kb_b_string(lstvis_data['instructions_symbols_size'])}));

  /***************************************************************** sections */
  result_element.append($('<h3>', { text: 'Sections'}));
  sections_accordion = $('<div>', { id: 'sections_accordion'});
  result_element.append(sections_accordion);

  $.each(lstvis_data['sections'], function(n, section) {
    e = $('<div>', {
      class: 'graph-container', 
      html: $('<div>', { 
        class: 'graph', 
        style: 'width:' + (section['size_dec'] / 
          lstvis_data['biggest_section_size']) * 800 + 'px',
        html: $('<span>', { 
          html: section['name'] })})});
    sections_accordion.append(e);
    sections_accordion.append(lstvis_create_section_info(section));
  });

  sections_accordion.accordion(
      {header:'div', collapsible:true, animate: false, active:false});

  /****************************************************************** symbols */
  result_element.append($('<h3>', { text: 'Symbols'}));
  symbols_accordion = $('<div>', { id: 'symbols_accordion'});
  result_element.append(symbols_accordion);
 
  $.each(lstvis_data['symbols'], function(n, symbol) {
    e = $('<div>', {
      class: 'graph-container', 
      html: $('<div>', { 
        class: 'graph', 
        style: 'width:' + (symbol['size_dec'] / 
          lstvis_data['biggest_symbol_size']) * 800 + 'px',
        html: $('<span>', { html: symbol['name'] })})});
    symbols_accordion.append(e);
    symbols_accordion.append(lstvis_create_symbol_info(symbol));
  });

  symbols_accordion.accordion(
      {header:'div', collapsible:true, animate: false, active:false});
};

/******************************************************************************/

