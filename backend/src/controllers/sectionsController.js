const Section = require('../models/Section');

const createSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ name: 1 });
    res.json({ sections });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { name, subsections } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Section name is required' });
    }

    const slug = createSlug(name);

    // Check if section already exists
    const existingSection = await Section.findOne({ slug });
    if (existingSection) {
      return res.status(400).json({ error: 'Section already exists' });
    }

    const formattedSubsections = (subsections || []).map(sub => ({
      name: sub.name || sub,
      slug: createSlug(sub.name || sub)
    }));

    const section = new Section({
      name,
      slug,
      subsections: formattedSubsections
    });

    await section.save();

    res.status(201).json({ section });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subsections } = req.body;

    const section = await Section.findById(id);

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (name) {
      section.name = name;
      section.slug = createSlug(name);
    }

    if (subsections) {
      section.subsections = subsections.map(sub => ({
        name: sub.name || sub,
        slug: createSlug(sub.name || sub)
      }));
    }

    await section.save();

    res.json({ section });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findByIdAndDelete(id);

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
};
