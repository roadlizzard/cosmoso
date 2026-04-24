const PHYSICS_TOPICS = [
  "Quantum_entanglement","Black_hole","Higgs_boson","Gravitational_waves","Dark_matter",
  "Casimir_effect","Double-slit_experiment","Schrödinger's_cat","Bell's_theorem","Hawking_radiation",
  "Photoelectric_effect","Special_relativity","General_relativity","Quantum_tunnelling","Pauli_exclusion_principle",
  "Superconductivity","Bose–Einstein_condensate","Cherenkov_radiation","Frame-dragging","Uncertainty_principle",
  "Wave–particle_duality","Quantum_chromodynamics","Standard_Model","Antimatter","Dark_energy",
  "Neutron_star","Pulsar","Magnetar","Quasar","Event_horizon",
  "Penrose_process","Spaghettification","Gravitational_lensing","Cosmic_microwave_background","Big_Bang",
  "Inflation_(cosmology)","Baryon_acoustic_oscillations","Cosmic_ray","Neutrino","Tachyon",
  "Plasma_(physics)","Fusion_power","Fission","Radioactive_decay","Half-life",
  "Photoionization","Spectroscopy","Redshift","Doppler_effect","Interference_(wave_propagation)",
  "Diffraction","Polarization_(waves)","Total_internal_reflection","Snell's_law","Brewster's_angle",
  "Blackbody_radiation","Planck's_law","Boltzmann_constant","Entropy","Thermodynamic_equilibrium",
  "Maxwell's_equations","Electromagnetic_induction","Hall_effect","Meissner_effect","Josephson_effect",
  "Tunnel_diode","Quantum_Hall_effect","Spin_(physics)","Magnetic_moment","Larmor_precession",
  "Nuclear_magnetic_resonance","Compton_scattering","Pair_production","Bremsstrahlung","Synchrotron_radiation",
  "Laser","Maser","Holography","Fiber_optics","Quantum_computing",
  "Spintronics","Topological_insulator","Graphene","Carbon_nanotube","Metamaterial",
  "Acoustic_resonance","Resonance","Harmonic_oscillator","Chaos_theory","Strange_attractor",
  "Soliton","Phonon","Polaron","Exciton","Plasmon",
  "Sonic_boom","Mach_number","Bernoulli's_principle","Magnus_effect","Venturi_effect",
  "Archimedes'_principle","Pascal's_law","Capillary_action","Surface_tension","Viscosity",
  "Brownian_motion","Osmosis","Diffusion","Percolation_theory","Fractal",
  "Time_dilation","Length_contraction","Mass–energy_equivalence","Lorentz_transformation","Minkowski_space",
  "Wormhole","Closed_timelike_curve","Multiverse","String_theory","Loop_quantum_gravity",
  "Antimatter","Positron","Muon","Tau_(particle)","Quark",
  "Gluon","W_and_Z_bosons","Photon","Graviton","Axion",
  "Penrose_diagram","Penrose_tiles","Fermi_paradox","Drake_equation","Olbers'_paradox",
  "Titius–Bode_law","Kepler's_laws_of_planetary_motion","Orbital_resonance","Lagrange_point","Roche_limit",
  "Tidal_locking","Precession","Nutation","Libration","Yarkovsky_effect",
  "Solar_wind","Magnetosphere","Van_Allen_radiation_belt","Aurora","Coronal_mass_ejection",
  "Sunspot","Solar_cycle","Heliosphere","Interstellar_medium","Molecular_cloud"
];

exports.handler = async function(event, context) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const idx = parseInt(today) % PHYSICS_TOPICS.length;
  const topic = PHYSICS_TOPICS[idx];

  try {
    const wikiRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
    );
    const wiki = await wikiRes.json();

    const fact = {
      title: wiki.title || topic.replace(/_/g, ' '),
      extract: wiki.extract || '',
      description: wiki.description || '',
      thumbnail: wiki.thumbnail ? wiki.thumbnail.source : null,
      wikiUrl: wiki.content_urls ? wiki.content_urls.desktop.page : `https://en.wikipedia.org/wiki/${topic}`,
      date: new Date().toISOString().slice(0, 10),
      topic
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify(fact)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch fact', topic })
    };
  }
};
