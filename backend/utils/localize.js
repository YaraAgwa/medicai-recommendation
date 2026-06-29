function getLang(req) {
  return req.query.lang === 'ar' ? 'ar' : 'en';
}

function localizeQuestion(q, lang) {
  if (!q) return q;
  if (lang === 'ar') {
    return {
      ...q,
      title: q.title_ar || q.title,
      body: q.body_ar || q.body,
    };
  }
  return q;
}

function localizeAnswer(a, lang) {
  if (!a) return a;
  if (lang === 'ar') {
    return {
      ...a,
      body: a.body_ar || a.body,
      question_title: a.question_title_ar || a.question_title,
    };
  }
  return a;
}

function localizeDoctor(d, lang) {
  if (!d) return d;
  if (lang === 'ar') {
    return {
      ...d,
      bio: d.bio_ar || d.bio,
      hospital: d.hospital_ar || d.hospital,
    };
  }
  return d;
}

module.exports = { getLang, localizeQuestion, localizeAnswer, localizeDoctor };
